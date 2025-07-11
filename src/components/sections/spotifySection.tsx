"use client";

import DraggableSpotifyCard from "@/components/cards/DraggableSpotifyCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSpotifyPlayback } from "@/features/spotify/SpotifyPlaybackContext";
import { useTopTracks } from "@/features/spotify/useSpotifyTracks";
import { useAppSelector } from "@/redux/hook";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SpotifySection() {
  const { status } = useSession();
  const { tracks, loading } = useTopTracks();
  const { currentTrackId, isPlaying, togglePlay, playerReady } =
    useSpotifyPlayback();
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const [expanded, setExpanded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [localTracks, setLocalTracks] = useState(tracks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local tracks when tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      setLocalTracks(tracks);
    }
  }, [tracks]);

  // Filter tracks by search term
  const filteredTracks = localTracks.filter((track) => {
    const term = searchTerm.toLowerCase();
    return (
      track.name.toLowerCase().includes(term) ||
      track.artists.some((artist) => artist.name.toLowerCase().includes(term))
    );
  });
  const itemsPerPage = expanded ? 10 : 5;
  const start = pageIndex * itemsPerPage;
  const end = start + itemsPerPage;
  const currentTracks = filteredTracks.slice(start, end);
  const currentTrackIds = currentTracks.map((track) => track.id);
  const hasMore = filteredTracks.length > end;

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalTracks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handlePlayToggle = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      togglePlay(trackId, track.uri);
    }
  };

  if (status === "loading" || loading) {
    return (
      <section className="mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Loading Spotify tracks..." />
          </div>
        </div>
      </section>
    );
  }

  if (status === "unauthenticated") {
    return (
      <section className="mb-12 text-center py-20">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-white">
          Connect Your Spotify
        </h2>
        <p className="text-gray-700 dark:text-gray-400 mb-6">
          Sign in to see your top tracks and listen to music.
        </p>
        <button
          onClick={() => signIn("spotify")}
          className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg border-2 border-green-700 shadow-lg hover:bg-green-600 hover:border-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Connect to Spotify
        </button>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentTrackIds}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 auto-rows-fr">
              {currentTracks.map((track) => (
                <DraggableSpotifyCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrackId === track.id && isPlaying}
                  onPlayToggle={handlePlayToggle}
                  playerReady={playerReady}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Controls */}
        <motion.div
          className="flex justify-end gap-4 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!expanded && currentTracks.length >= 5 && (
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
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-800 border border-gray-400 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              )}

              {hasMore && (
                <motion.button
                  onClick={handleNext}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white border border-blue-700 dark:bg-blue-500 dark:text-white dark:border-blue-400 rounded hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
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
