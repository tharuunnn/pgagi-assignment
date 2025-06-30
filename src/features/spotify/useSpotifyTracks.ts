"use client";

import { getFromCache, setInCache } from "@/lib/cache";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

interface PlaylistItem {
  track: SpotifyTrack;
}

export function useSpotifyTracks() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      console.log("Not authenticated yet");
      return;
    }

    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("Access token:", session?.accessToken);

    // If refresh failed, prompt user to reconnect Spotify
    if (session.hasRefreshFailed) {
      console.log("Token refresh failed, redirecting to sign in");
      signIn("spotify"); // Redirect to reconnect
      return;
    }

    const fetchTrendingTracks = async () => {
      try {
        if (!session.accessToken) {
          throw new Error("No access token available");
        }

        console.log(
          "Making request with token:",
          session.accessToken.substring(0, 10) + "..."
        );

        // Fetch tracks from Spotify's Top 50 Global playlist
        const playlistResponse = await fetch(
          "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=50",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log("Response status:", playlistResponse.status);

        if (!playlistResponse.ok) {
          const errorText = await playlistResponse.text();
          console.error("Playlist response error:", errorText);
          throw new Error(
            `Failed to fetch playlist: ${playlistResponse.status} - ${errorText}`
          );
        }

        const playlistData = await playlistResponse.json();
        console.log(
          "Got playlist data with items:",
          playlistData.items?.length
        );

        const playlistTracks = playlistData.items
          .filter((item: PlaylistItem) => item.track && item.track.id) // Filter out null tracks
          .map((item: PlaylistItem) => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists,
            album: item.track.album,
            external_urls: item.track.external_urls,
            uri: item.track.uri,
          }));

        setTracks(playlistTracks);
      } catch (error) {
        console.error("Error fetching Spotify tracks:", error);
        setError(error instanceof Error ? error.message : String(error));
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTracks();
  }, [session, status]);

  return { tracks, loading, error };
}

export function useTopTracks() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    // If refresh failed, prompt user to reconnect Spotify
    if (session.hasRefreshFailed) {
      signIn("spotify"); // Redirect to reconnect
      return;
    }

    const fetchTopTracks = async () => {
      try {
        const cacheKey = "spotify-top-tracks";
        const cachedTracks = getFromCache<SpotifyTrack[]>(cacheKey);

        if (cachedTracks) {
          setTracks(
            cachedTracks.map((track: SpotifyTrack) => ({
              id: track.id,
              name: track.name,
              artists: track.artists,
              album: track.album,
              external_urls: track.external_urls,
              uri: track.uri,
            }))
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=50",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch top tracks");
        }

        const data = await response.json();
        setTracks(
          data.items.map((track: SpotifyTrack) => ({
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            external_urls: track.external_urls,
            uri: track.uri,
          }))
        );
        setInCache(cacheKey, data.items);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Could not load Spotify tracks.");
        } else {
          toast.error("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [session, status]);

  return { tracks, loading };
}
