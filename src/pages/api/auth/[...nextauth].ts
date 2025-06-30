import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // 1 hour
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // fall back to old refresh token
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-top-read",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      const now = Date.now();

      // First sign in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: now + account.expires_in * 1000, // expires_in is in seconds
          refreshToken: account.refresh_token,
        };
      }

      // If token still valid, return it
      if (token.accessTokenExpires && now < token.accessTokenExpires) {
        return token;
      }

      // Token expired, refresh it
      const refreshed = await refreshAccessToken(token);

      if ('error' in refreshed) {
        return {
          ...refreshed,
          accessToken: null, // important
          hasRefreshFailed: true,
        };
      }
      return refreshed;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.hasRefreshFailed = !!token.hasRefreshFailed;
      return session;
    },
  },
};

export default NextAuth(authOptions);
