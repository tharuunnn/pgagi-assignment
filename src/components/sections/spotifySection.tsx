"use client";

import { useState } from "react";
import { useSpotifyTracks } from "@/features/spotify/useSpotifyTracks";
import Image from "next/image";

export default function SpotifySection() {
  const { tracks, loading } = useSpotifyTracks();
  const [expanded, setExpanded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const itemsPerPage = expanded ? 10 : 5;
  const start = pageIndex * itemsPerPage;
  const end = start + itemsPerPage;
  const currentTracks = tracks.slice(start, end);
  const hasMore = tracks.length > end;

  const handleExpand = () => {
    setExpanded(true);
    setPageIndex(0);
  };

  const handleNext = () => {
    if (hasMore) setPageIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (pageIndex > 0) setPageIndex((prev) => prev - 1);
  };

  if (loading) return <p className="text-white ml-4">Loading music...</p>;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-black dark:text-white mb-4 ml-4">
        Top Tracks
      </h2>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 auto-rows-fr">
          {currentTracks.map((track) => (
            <div
              key={track.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 text-white shadow-md flex flex-col"
            >
              <Image
                src={track.album.images[0]?.url || "/fallback.jpg"}
                alt={track.name}
                className="rounded-md mb-2 w-full h-40 object-cover"
                width={500}
                height={160}
                unoptimized
                priority
              />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {track.name}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-4 mt-6">
          {!expanded && currentTracks.length >= 5 && (
            <button
              onClick={handleExpand}
              className="text-sm px-3 py-1.5 bg-white text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Expand
            </button>
          )}

          {expanded && (
            <>
              {pageIndex === 0 ? (
                <button
                  onClick={() => {
                    setExpanded(false);
                    setPageIndex(0);
                  }}
                  className="text-sm px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-700 dark:text-white rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors"
                >
                  Collapse
                </button>
              ) : (
                <button
                  onClick={handleBack}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              )}

              {hasMore && (
                <button
                  onClick={handleNext}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                >
                  Next
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
