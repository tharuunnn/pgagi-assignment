"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useEffect, useState } from "react";
import { fetchNewsForCategory } from "./contentSlice";

export function useLoadContent() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.preferences.categories);
  const activeCategory = useAppSelector((state) => state.preferences.activeCategory);
  const fetchedCategories = useAppSelector((state) => state.content.fetchedCategories);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (activeCategory === "all") {
        const promises = categories.map((category) => {
          if (!fetchedCategories.includes(category)) {
            return dispatch(fetchNewsForCategory(category));
          }
        });
        await Promise.all(promises);
      } else {
        if (!fetchedCategories.includes(activeCategory)) {
          await dispatch(fetchNewsForCategory(activeCategory));
        }
      }
      setLoading(false);
    };

    load();
  }, [categories, activeCategory, fetchedCategories, dispatch]);

  return loading;
}
