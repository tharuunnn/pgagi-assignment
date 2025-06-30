"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect } from "react";
import { fetchNews } from "./contentSlice";

export function useLoadContent() {
  const dispatch = useAppDispatch();
  const { categories, activeCategory, fetchedCategories } = useAppSelector(
    (state) => ({
      categories: state.preferences.categories,
      activeCategory: state.preferences.activeCategory,
      fetchedCategories: state.content.fetchedCategories,
    })
  );

  useEffect(() => {
    // On initial load, if the "all" category is selected and hasn't been "fetched"
    // (a proxy for initial load), fetch all default categories.
    if (activeCategory === "all" && !fetchedCategories.includes("all")) {
      dispatch(fetchNews({ categories, page: 1 }));
    }
    // If a specific category is selected and it hasn't been fetched yet, fetch it.
    else if (
      activeCategory !== "all" &&
      !fetchedCategories.includes(activeCategory)
    ) {
      dispatch(fetchNews({ categories: [activeCategory], page: 1 }));
    }
  }, [dispatch, activeCategory, categories, fetchedCategories]);
}
