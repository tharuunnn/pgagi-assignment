"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { toggleFavourite } from "@/features/content/contentSlice";
import {
  setActiveCategory,
  addCategory,
} from "@/preferences/preferencesSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useLoadTrending } from "@/features/content/useLoadTrending";
import NewsCard from "@/components/cards/NewsCard";
import clsx from "clsx";
import { useState } from "react";

type NewsSectionProps = {
  variant?: "default" | "trending";
};

export default function NewsSection({ variant = "default" }: NewsSectionProps) {
  const dispatch = useAppDispatch();

  // Load feed based on section type
  const loading =
    variant === "trending" ? useLoadTrending() : useLoadContent();

  // Select correct feed
  const feed = useAppSelector((state) =>
    variant === "trending" ? state.content.trendingFeed : state.content.feed
  );

    if (variant === "trending") {
    console.log("TRENDING FEED", feed);
  }
  
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const activeCategory = useAppSelector(
    (state) => state.preferences.activeCategory
  );

  // Handle pagination & UI state
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = expanded ? 6 : 3;

  const categories = ["all", "technology", "sports", "health", "entertainment"];

  // Filter feed
  const filteredFeed = feed.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase());

    const matchesCategory =
      variant === "trending"
        ? true
        : activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredFeed.length / itemsPerPage);
  const paginatedFeed = filteredFeed.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  // Interactions
  const handleFavourite = (id: string) => {
    dispatch(toggleFavourite(id));
  };

  const handleCategoryClick = (category: string) => {
    dispatch(setActiveCategory(category));
    dispatch(addCategory(category));
    setPage(0);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {variant === "trending" ? "Trending News" : "Top News"}
        </h2>

        {/* Category Buttons */}
        {variant === "default" && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={clsx(
                  "text-sm px-3 py-1.5 rounded-full border transition-colors",
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                )}
              >
                {cat[0].toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {paginatedFeed.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No content found.
            </p>
          ) : (
            paginatedFeed.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-end items-center gap-3 mt-6">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="text-sm px-3 py-1.5 bg-white text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Expand
            </button>
          ) : (
            <>
              {page > 0 ? (
                <button
                  onClick={() => setPage(page - 1)}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={() => {
                    setExpanded(false);
                    setPage(0);
                  }}
                  className="text-sm px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-700 dark:text-white rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors"
                >
                  Collapse
                </button>
              )}
              {page < totalPages - 1 && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                >
                  Next
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
