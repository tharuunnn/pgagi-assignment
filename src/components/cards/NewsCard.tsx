"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Heart, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NewsCard({ item }: { item: ContentItem }) {
  const dispatch = useAppDispatch();
  const [isPlaying, setIsPlaying] = useState(false);

  // Get the current favourite status from Redux state
  const currentItem = useAppSelector(
    (state) =>
      state.content.feed.find((i) => i.id === item.id) ||
      state.content.trendingFeed.find((i) => i.id === item.id)
  );

  const isFavourite = currentItem?.isFavourite || item.isFavourite || false;

  const handleFavourite = () => {
    dispatch(toggleFavourite(item.id));
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    // Here you would integrate with Spotify API for actual playback
    console.log(`${isPlaying ? "Paused" : "Playing"}: ${item.title}`);
  };

  return (
    <motion.div
      className="flex flex-col w-full bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full card-hover"
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full aspect-video overflow-hidden group">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.title}
          width={400}
          height={250}
          className="object-cover rounded-t-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Play Button Overlay for Spotify Items */}
        {item.type === "spotify" && (
          <motion.button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="bg-white rounded-full p-3">
              {isPlaying ? (
                <Pause size={24} className="text-black" />
              ) : (
                <Play size={24} className="text-black" fill="currentColor" />
              )}
            </div>
          </motion.button>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
            {item.title}
          </h3>
          <motion.button
            onClick={handleFavourite}
            className={clsx(
              "p-1 rounded-full transition-colors flex-shrink-0",
              isFavourite
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart fill={isFavourite ? "currentColor" : "none"} />
          </motion.button>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="pt-2">
          <Link
            href={item.url}
            target="_blank"
            className="inline-flex items-center text-blue-700 dark:text-blue-400 font-medium hover:underline"
          >
            {item.type === "spotify" ? (
              <>
                <Play size={16} className="mr-1" />
                {isPlaying ? "Playing..." : "Play Now"}
              </>
            ) : (
              <>Read More</>
            )}
          </Link>
        </div>

        {/* Play Status Indicator for Spotify Items */}
        {item.type === "spotify" && isPlaying && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Playing
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
