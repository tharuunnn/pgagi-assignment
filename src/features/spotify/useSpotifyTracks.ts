"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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

export function useSpotifyTracks() {
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

    const fetchTrendingTracks = async () => {
      try {
        console.log("Access Token:", session?.accessToken);
        // Fetch tracks from Spotify's Top 50 Global playlist
        const playlistResponse = await fetch(
          "https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks?limit=50",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!playlistResponse.ok) {
          throw new Error("Failed to fetch playlist");
        }

        const playlistData = await playlistResponse.json();
        const playlistTracks = playlistData.items
          .filter((item: any) => item.track && item.track.id) // Filter out null tracks
          .map((item: any) => ({
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
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTracks();
  }, [session, status]);

  return { tracks, loading };
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
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=50",
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch tracks");

        const data = await response.json();
        const topTracks = data.items.map((track: any) => ({
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          external_urls: track.external_urls,
          uri: track.uri,
        }));
        setTracks(topTracks);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [session, status]);

  return { tracks, loading };
}
