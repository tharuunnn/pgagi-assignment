"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { fetchNewsForCategory } from "./contentSlice";

export function useLoadContent() {
  const dispatch = useAppDispatch();

  const categories = useAppSelector((state) => state.preferences.categories);
  const activeCategory = useAppSelector((state) => state.preferences.activeCategory);
  const fetchedCategories = useAppSelector((state) => state.content.fetchedCategories);

  useEffect(() => {
    if (activeCategory === "all") {
      categories.forEach((category) => {
        if (!fetchedCategories.includes(category)) {
          dispatch(fetchNewsForCategory(category));
        }
      });
    } else {
      if (!fetchedCategories.includes(activeCategory)) {
        dispatch(fetchNewsForCategory(activeCategory));
      }
    }
  }, [categories, activeCategory, fetchedCategories, dispatch]);
}
