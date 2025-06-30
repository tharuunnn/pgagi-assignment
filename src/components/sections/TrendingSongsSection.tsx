"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ContentItem,
  setTrendingSongsFeed,
} from "@/features/content/contentSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import YouTubeCard from "../cards/YouTubeCard";

interface YouTubeSongItem extends ContentItem {
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
  const dispatch = useAppDispatch();
  const [videos, setVideos] = useState<YouTubeSongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const trendingSongsFeed = useAppSelector(
    (state) => state.content.trendingSongsFeed
  );

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
        // Get favourite IDs from localStorage
        const favouriteIds = new Set(
          JSON.parse(localStorage.getItem("favourites") || "[]")
        );
        // Map YouTube API results to ContentItem shape for Redux
        const mapped = data.items.map((video: YouTubeSongItem) => ({
          ...video,
          id: video.id,
          title: video.snippet.title,
          description: "",
          image: video.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          category: "music",
          type: "spotify",
          isFavourite: favouriteIds.has(video.id),
        }));
        setVideos(mapped);
        dispatch(setTrendingSongsFeed(mapped));
        setNextPageToken(data.nextPageToken);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Could not load trending songs.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    getInitialVideos();
  }, []);

  useEffect(() => {
    // Only update if trendingSongsFeed is not empty
    if (trendingSongsFeed.length > 0) {
      setVideos(trendingSongsFeed as YouTubeSongItem[]);
    }
  }, [trendingSongsFeed]);

  const handleLoadMore = async () => {
    if (!nextPageToken) return;

    try {
      setLoadingMore(true);
      const data = await fetchVideos(nextPageToken);
      // Get favourite IDs from localStorage
      const favouriteIds = new Set(
        JSON.parse(localStorage.getItem("favourites") || "[]")
      );
      // Map YouTube API results to ContentItem shape for Redux
      const mapped = data.items.map((video: YouTubeSongItem) => ({
        ...video,
        id: video.id,
        title: video.snippet.title,
        description: "",
        image: video.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        category: "music",
        type: "spotify",
        isFavourite: favouriteIds.has(video.id),
      }));
      setVideos((prevVideos) => [...prevVideos, ...mapped]);
      dispatch(setTrendingSongsFeed([...videos, ...mapped]));
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Could not load more songs.";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Trending Songs..." />;
  }

  // Filter videos by search term
  const filteredVideos = videos.filter((video) => {
    const term = searchTerm.toLowerCase();
    return (
      video.title.toLowerCase().includes(term) ||
      video.snippet.channelTitle.toLowerCase().includes(term)
    );
  });

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <YouTubeCard key={video.id} video={video} />
          ))}
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
      </div>
    </section>
  );
}
