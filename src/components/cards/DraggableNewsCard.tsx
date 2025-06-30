"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { motion } from "framer-motion";
import { GripVertical, Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DraggableNewsCardProps {
  item: ContentItem;
}

export default function DraggableNewsCard({ item }: DraggableNewsCardProps) {
  const dispatch = useAppDispatch();
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

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
      ref={setNodeRef}
      style={style}
      className="relative group h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div
        className={clsx(
          "flex flex-col w-full bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full",
          isDragging ? "shadow-2xl scale-105 opacity-80" : "hover:shadow-lg"
        )}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} className="text-white" />
        </div>

        <div className="relative w-full aspect-video overflow-hidden">
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
                <Play
                  size={24}
                  className={clsx(
                    "text-black transition-all",
                    isPlaying ? "text-green-600" : "text-black"
                  )}
                  fill={isPlaying ? "currentColor" : "none"}
                />
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
        </div>
      </div>
    </motion.div>
  );
}
