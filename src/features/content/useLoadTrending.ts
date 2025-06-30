"use client";

import { useAppDispatch } from "@/redux/hook";
import axios from "axios";
import { useEffect, useState } from "react";
import { setTrendingNewsFeed, setTrendingSongsFeed } from "./contentSlice";

// For trending news (default)
export function useLoadTrending() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("/api/trending");
        const favouriteIds = new Set(
          JSON.parse(localStorage.getItem("favourites") || "[]")
        );
        // Map API results to ContentItem shape for Redux
        const mapped = (res.data || []).map((item: any) => ({
          ...item,
          isFavourite: favouriteIds.has(item.id),
        }));
        dispatch(setTrendingNewsFeed(mapped));
      } catch (err) {
        console.error("Failed to load trending news", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [dispatch]);

  return loading;
}

// For trending YouTube music
export function useLoadTrendingSongs() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        const res = await axios.get("/api/trending-yt");
        const favouriteIds = new Set(
          JSON.parse(localStorage.getItem("favourites") || "[]")
        );
        // Map YouTube API results to ContentItem shape for Redux
        const mapped = (res.data.items || []).map((video: any) => ({
          ...video,
          id: video.id,
          title: video.snippet.title,
          description: "",
          image: video.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          category: "music",
          type: "spotify",
          isFavourite: favouriteIds.has(video.id),
          snippet: video.snippet,
        }));
        dispatch(setTrendingSongsFeed(mapped));
      } catch (err) {
        console.error("Failed to load trending songs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSongs();
  }, [dispatch]);

  return loading;
}
