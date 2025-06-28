"use client";

import { useSpotifyTracks } from "@/features/spotify/useSpotifyTracks";
import Image from "next/image";

export default function SpotifySection() {
  const { tracks, loading } = useSpotifyTracks();

  if (loading) return <p className="text-white">Loading music...</p>;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">Top Tracks</h2>
      <div className="flex overflow-x-auto gap-4 pb-2">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="min-w-[200px] bg-gray-800 rounded-lg p-4 text-white shadow-md flex-shrink-0"
          >
            <Image
              src={track.album.images[0]?.url || "/fallback.jpg"} // fallback optional
              alt={track.name}
              className="rounded-md mb-2 h-40 w-full object-cover"
              width={500} // or appropriate width
              height={160} // or appropriate height
              unoptimized // optional: skip Next.js image optimization if needed
            />
            <h3 className="font-semibold">{track.name}</h3>
            <p className="text-sm text-gray-300">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
