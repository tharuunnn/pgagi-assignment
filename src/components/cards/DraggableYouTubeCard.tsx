"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import Image from "next/image";

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface DraggableYouTubeCardProps {
  video: YouTubeVideo;
}

export default function DraggableYouTubeCard({
  video,
}: DraggableYouTubeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <motion.div ref={setNodeRef} style={style} className="h-full" layout>
      <div
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-full transition-all duration-300 relative",
          isDragging ? "shadow-2xl scale-105 opacity-80" : "hover:shadow-lg"
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-10 p-1 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} className="text-white" />
        </div>
        <Image
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          width={480}
          height={360}
          className="rounded mb-2 w-full h-40 object-cover"
        />
        <h3 className="font-semibold text-center mb-1 line-clamp-2 flex-grow text-gray-900 dark:text-white">
          {video.snippet.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-300 text-center mb-2">
          {video.snippet.channelTitle}
        </p>
        <div className="w-full flex justify-center mt-auto pt-2">
          <iframe
            width="100%"
            height="180"
            src={`https://www.youtube.com/embed/${video.id}`}
            title={video.snippet.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="pointer-events-none"
          ></iframe>
        </div>
      </div>
    </motion.div>
  );
}
