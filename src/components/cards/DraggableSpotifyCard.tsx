"use client";

import clsx from "clsx";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { GripVertical, Pause, Play } from "lucide-react";
import Image from "next/image";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

interface DraggableSpotifyCardProps {
  track: SpotifyTrack;
  index: number;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isPlaying?: boolean;
  onPlayToggle?: (trackId: string) => void;
  playerReady?: boolean;
}

export default function DraggableSpotifyCard({
  track,
  index,
  onReorder,
  isDragging,
  onDragStart,
  onDragEnd,
  isPlaying = false,
  onPlayToggle,
  playerReady = false,
}: DraggableSpotifyCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);
  const scale = useTransform(x, [-100, 0, 100], [0.95, 1, 0.95]);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playerReady && onPlayToggle) {
      onPlayToggle(track.id);
    } else {
      console.log("Player not ready or no play toggle function");
    }
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
      className="relative group"
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
      layout
    >
      <div
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex flex-col transition-all duration-300",
          isDragging ? "shadow-2xl scale-105 z-50" : "hover:shadow-lg"
        )}
      >
        {/* Drag Handle */}
        <div className="absolute top-2 left-2 z-10 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical size={16} className="text-white" />
        </div>

        <div className="relative mb-3">
          <Image
            src={track.album.images[0]?.url || "/fallback.jpg"}
            alt={track.name}
            className="rounded-md w-full h-40 object-cover"
            width={500}
            height={160}
            unoptimized
            priority
          />

          {/* Play Button Overlay */}
          <motion.button
            onClick={handlePlay}
            className={clsx(
              "absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity",
              !playerReady && "cursor-not-allowed opacity-50"
            )}
            whileHover={playerReady ? { scale: 1.1 } : {}}
            whileTap={playerReady ? { scale: 0.9 } : {}}
            disabled={!playerReady}
          >
            <div className="bg-white rounded-full p-3">
              {isPlaying ? (
                <Pause size={24} className="text-black" />
              ) : (
                <Play size={24} className="text-black" fill="currentColor" />
              )}
            </div>
          </motion.button>
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm line-clamp-2 mb-1">
          {track.name}
        </h3>

        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">
          {track.artists.map((a) => a.name).join(", ")}
        </p>

        {/* Play Status Indicator */}
        {isPlaying && (
          <motion.div
            className="mt-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 dark:text-green-400">
              Playing
            </span>
          </motion.div>
        )}

        {/* Player Ready Indicator */}
        {!playerReady && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Player initializing...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
