"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSpotifyTracks() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchTopTracks = async () => {
      setLoading(true);
      const res = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=15",
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await res.json();
      setTracks(data.items || []);
      setLoading(false);
    };

    fetchTopTracks();
  }, [session]);

  return { tracks, loading };
}
