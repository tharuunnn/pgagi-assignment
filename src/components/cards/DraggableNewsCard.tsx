"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import clsx from "clsx";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { GripVertical, Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DraggableNewsCardProps {
  item: ContentItem;
  index: number;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function DraggableNewsCard({
  item,
  index,
  onReorder,
  isDragging,
  onDragStart,
  onDragEnd,
}: DraggableNewsCardProps) {
  const dispatch = useAppDispatch();
  const [isPlaying, setIsPlaying] = useState(false);

  // Get the current favourite status from Redux state
  const currentItem = useAppSelector(
    (state) =>
      state.content.feed.find((i) => i.id === item.id) ||
      state.content.trendingFeed.find((i) => i.id === item.id)
  );

  const isFavourite = currentItem?.isFavourite || item.isFavourite || false;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);

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

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150; // Increased threshold for better UX
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      const newIndex = Math.max(0, Math.min(index + direction, 999));
      if (newIndex !== index) {
        onReorder?.(index, newIndex);
      }
    }
    onDragEnd?.();
  };

  return (
    <motion.div
      className="relative group h-full"
      style={{ x, y, rotate, scale }}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={handleDragEnd}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={clsx(
          "flex flex-col w-full bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full",
          isDragging ? "shadow-2xl scale-105 z-50" : "hover:shadow-lg"
        )}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-2 z-10 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
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
        </div>
      </div>
    </motion.div>
  );
}
