"use client";

import DraggableSpotifyCard from "@/components/cards/DraggableSpotifyCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSpotifyPlayback } from "@/features/spotify/SpotifyPlaybackContext";
import { useSpotifyTracks } from "@/features/spotify/useSpotifyTracks";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function TrendingSongsSection() {
  const { tracks, loading } = useSpotifyTracks();
  const { currentTrackId, isPlaying, togglePlay, playerReady } =
    useSpotifyPlayback();
  const [expanded, setExpanded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localTracks, setLocalTracks] = useState(tracks);

  const itemsPerPage = expanded ? 8 : 4;
  const start = pageIndex * itemsPerPage;
  const end = start + itemsPerPage;
  const currentTracks = localTracks.slice(start, end);
  const hasMore = localTracks.length > end;

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

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newTracks = [...localTracks];
    const [movedTrack] = newTracks.splice(fromIndex, 1);
    newTracks.splice(toIndex, 0, movedTrack);
    setLocalTracks(newTracks);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handlePlayToggle = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      togglePlay(trackId, track.uri);
    }
  };

  // Update local tracks when tracks change
  if (tracks.length > 0 && localTracks.length === 0) {
    setLocalTracks(tracks);
  }

  if (loading) {
    return (
      <section className="mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Trending Songs
          </h2>
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading trending songs..." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Trending Songs
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
          <AnimatePresence mode="wait">
            {currentTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                }}
                layout
              >
                <DraggableSpotifyCard
                  track={track}
                  index={index}
                  onReorder={handleReorder}
                  isDragging={draggedIndex === index}
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                  isPlaying={currentTrackId === track.id && isPlaying}
                  onPlayToggle={handlePlayToggle}
                  playerReady={playerReady}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <motion.div
          className="flex justify-end gap-4 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!expanded && currentTracks.length >= 4 && (
            <motion.button
              onClick={handleExpand}
              className="text-sm px-3 py-1.5 bg-white text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Expand
            </motion.button>
          )}

          {expanded && (
            <>
              {pageIndex === 0 ? (
                <motion.button
                  onClick={() => {
                    setExpanded(false);
                    setPageIndex(0);
                  }}
                  className="text-sm px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-700 dark:text-white rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Collapse
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleBack}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              )}

              {hasMore && (
                <motion.button
                  onClick={handleNext}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
