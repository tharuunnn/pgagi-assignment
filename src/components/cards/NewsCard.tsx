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
      state.content.trendingNewsFeed.find((i) => i.id === item.id)
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
      className="flex flex-col w-full bg-card-light dark:bg-card-dark rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden transition-all duration-300 h-full"
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative w-full aspect-video overflow-hidden group">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.title}
          width={400}
          height={250}
          className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Play Button Overlay for Spotify Items */}
        {item.type === "spotify" && (
          <motion.button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl"
              whileHover={{
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              }}
            >
              {isPlaying ? (
                <Pause size={28} className="text-primary-600" />
              ) : (
                <Play
                  size={28}
                  className="text-primary-600 ml-1"
                  fill="currentColor"
                />
              )}
            </motion.div>
          </motion.button>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
            {item.title}
          </h3>
          <motion.button
            onClick={handleFavourite}
            className={clsx(
              "p-2 rounded-full transition-colors flex-shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800",
              isFavourite
                ? "text-red-500 dark:text-red-500"
                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              size={20}
              fill={isFavourite ? "currentColor" : "none"}
              className={clsx(
                "transition-transform duration-300",
                isFavourite && "animate-[heartBeat_0.3s_ease-in-out]"
              )}
            />
          </motion.button>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3 flex-1">
          {item.description}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <Link
            href={item.url}
            target="_blank"
            className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            {item.type === "spotify" ? (
              <>
                <Play
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
                {isPlaying ? "Now Playing" : "Play Track"}
              </>
            ) : (
              <>
                Read Article
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </Link>

          {/* Play Status Indicator for Spotify Items */}
          {item.type === "spotify" && isPlaying && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex gap-1">
                <div
                  className="w-1 h-3 bg-accent-green rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-1 h-3 bg-accent-green rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1 h-3 bg-accent-green rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <span className="text-xs font-medium text-accent-green">
                Playing
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
