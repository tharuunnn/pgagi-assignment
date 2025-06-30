"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function TrendingSongsSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchVideos = async (token: string | null = null) => {
    let url = "/api/trending-yt";
    if (token) {
      url += `?pageToken=${token}`;
    }
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to fetch YouTube trending music"
      );
    }
    return res.json();
  };

  useEffect(() => {
    async function getInitialVideos() {
      try {
        setLoading(true);
        const data = await fetchVideos();
        setVideos(data.items);
        setNextPageToken(data.nextPageToken);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Could not load trending songs.");
      } finally {
        setLoading(false);
      }
    }
    getInitialVideos();
  }, []);

  const handleLoadMore = async () => {
    if (!nextPageToken) return;

    try {
      setLoadingMore(true);
      const data = await fetchVideos(nextPageToken);
      setVideos((prevVideos) => [...prevVideos, ...data.items]);
      setNextPageToken(data.nextPageToken);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not load more songs.");
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Trending Songs..." />;
  }

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {videos.map((video, index) => (
            <motion.div
              key={video.id + `-${index}`}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-full">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="rounded mb-2 w-full h-40 object-cover"
                />
                <h3 className="font-semibold text-center mb-1 line-clamp-2 flex-grow">
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
                  ></iframe>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {nextPageToken && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
