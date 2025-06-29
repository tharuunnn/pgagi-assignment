"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSpotifyTracks() {
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<any[]>([]);
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
        const res = await fetch("https://api.spotify.com/v1/me/top/tracks", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch tracks");

        const data = await res.json();
        setTracks(data.items);
      } catch (error) {
        console.error("Error fetching Spotify tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [session, status]);

  return { tracks, loading };
}
