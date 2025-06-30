"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Image from "next/image";

interface YouTubeCardProps {
  video: ContentItem & {
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
    };
  };
}

export default function YouTubeCard({ video }: YouTubeCardProps) {
  const dispatch = useAppDispatch();
  // Get the current favourite status from Redux state (like NewsCard)
  const currentItem = useAppSelector(
    (state) =>
      state.content.feed.find((i) => i.id === video.id) ||
      state.content.trendingSongsFeed.find((i) => i.id === video.id)
  );
  const isFavourite = currentItem?.isFavourite || video.isFavourite || false;
  const handleFavourite = () => {
    dispatch(toggleFavourite(video.id));
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-full transition-all duration-300 relative hover:shadow-lg">
      <a
        href={`https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Image
          src={video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          width={480}
          height={360}
          className="rounded mb-2 w-full h-40 object-cover"
        />
      </a>
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-left line-clamp-2 flex-grow text-gray-900 dark:text-white">
          {video.snippet.title}
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
      <p className="text-sm text-gray-500 dark:text-gray-300 text-left mb-2">
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
        ></iframe>
      </div>
    </div>
  );
}
