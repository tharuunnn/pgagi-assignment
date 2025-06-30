"use client";

import Loader from "@/components//Loader";
import NewsCard from "@/components/cards/NewsCard";
import YouTubeCard from "@/components/cards/YouTubeCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ContentItem } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useLoadTrendingSongs } from "@/features/content/useLoadTrending";
import { useAppSelector } from "@/redux/hook";
import { motion } from "framer-motion";
import { Music, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";

// Type guard for YouTubeSongItem
function isYouTubeSongItem(item: unknown): item is ContentItem & {
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium: { url: string } };
  };
} {
  if (
    typeof item === "object" &&
    item !== null &&
    "snippet" in item &&
    typeof (item as Record<string, unknown>).snippet === "object" &&
    (item as Record<string, unknown>).snippet !== null
  ) {
    const snippet = (item as Record<string, unknown>).snippet as Record<
      string,
      unknown
    >;
    return (
      typeof snippet.title === "string" &&
      typeof snippet.channelTitle === "string" &&
      typeof snippet.thumbnails === "object" &&
      snippet.thumbnails !== null &&
      typeof (snippet.thumbnails as Record<string, unknown>).medium ===
        "object" &&
      (snippet.thumbnails as Record<string, unknown>).medium !== null &&
      typeof (
        (snippet.thumbnails as Record<string, unknown>).medium as Record<
          string,
          unknown
        >
      ).url === "string"
    );
  }
  return false;
}

export default function FavouritesPage() {
  useLoadContent(); // Ensure feed is loaded
  useLoadTrendingSongs(); // Ensure trendingFeed is loaded with YouTube music

  const { feed, trendingNewsFeed, trendingSongsFeed } = useAppSelector(
    (state) => state.content
  );
  const [showType, setShowType] = useState<"news" | "songs">("news");
  const [favouriteNews, setFavouriteNews] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Load favourite news articles from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("favouriteNewsArticles");
      if (stored) {
        try {
          setFavouriteNews(JSON.parse(stored));
        } catch {
          setFavouriteNews([]);
        }
      } else {
        setFavouriteNews([]);
      }
    }
  }, [feed, trendingNewsFeed]);

  if (
    feed.length === 0 &&
    trendingNewsFeed.length === 0 &&
    trendingSongsFeed.length === 0 &&
    favouriteNews.length === 0
  ) {
    return (
      <DashboardLayout>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Your Favourites
        </h2>
        <Loader />
      </DashboardLayout>
    );
  }

  const allItems = [...feed, ...trendingNewsFeed, ...trendingSongsFeed];
  const uniqueFavourites = allItems.reduce((acc, current) => {
    if (current.isFavourite && !acc.find((item) => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as ContentItem[]);

  // Merge uniqueFavourites (from Redux) with favouriteNews (from localStorage), avoiding duplicates
  const allFavouriteNews = [
    ...favouriteNews,
    ...uniqueFavourites.filter(
      (item) =>
        item.type !== "spotify" && !favouriteNews.some((f) => f.id === item.id)
    ),
  ];

  const favouriteSongs = trendingSongsFeed.filter(
    (item) =>
      item.isFavourite && item.type === "spotify" && isYouTubeSongItem(item)
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Your Favourites
        </h2>
        <motion.div
          className="mb-6 flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => setShowType("news")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showType === "news"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Newspaper size={16} />
            News
          </motion.button>
          <motion.button
            onClick={() => setShowType("songs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showType === "songs"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Music size={16} />
            Songs
          </motion.button>
        </motion.div>
        {showType === "news" ? (
          allFavouriteNews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No favourite news yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFavouriteNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )
        ) : favouriteSongs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No favourite songs yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favouriteSongs.filter(isYouTubeSongItem).map((item) => (
              <YouTubeCard key={item.id} video={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
