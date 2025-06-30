"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hook";
import { setTrendingFeed } from "./contentSlice";
import axios from "axios";

export function useLoadTrending() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("/api/trending"); 
        dispatch(setTrendingFeed(res.data));
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
