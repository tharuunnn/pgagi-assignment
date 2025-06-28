"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { fetchNews } from "./contentAPI";
import { setFeed } from "./contentSlice";

export function useLoadContent() {
  const dispatch = useAppDispatch(); //dispatch fn type for sending action to reducer
  const categories = useAppSelector((state) => state.preferences.categories); //taking in state - preferences, check preferencesSlice.ts

  useEffect(() => {
    async function load() {
      try {
        const news = await fetchNews(categories);
        dispatch(setFeed(news));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    }
    load();
  }, [categories, dispatch]); // if catergories change, reload the news
}
