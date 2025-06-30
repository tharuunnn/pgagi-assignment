"use client";

import DraggableNewsCard from "@/components/cards/DraggableNewsCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useLoadTrending } from "@/features/content/useLoadTrending";
import { addCategory, setActiveCategory } from "@/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type NewsSectionProps = {
  variant?: "default" | "trending";
};

export default function NewsSection({ variant = "default" }: NewsSectionProps) {
  const dispatch = useAppDispatch();

  // Load feed based on section type - call hooks unconditionally
  const contentLoading = useLoadContent();
  const trendingLoading = useLoadTrending();
  const loading = variant === "trending" ? trendingLoading : contentLoading;

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localFeed, setLocalFeed] = useState(feed);
  const itemsPerPage = expanded ? 6 : 3;

  const categories = ["all", "technology", "sports", "health", "entertainment"];

  // Filter feed
  const filteredFeed = localFeed.filter((item) => {
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
  const handleCategoryClick = (category: string) => {
    dispatch(setActiveCategory(category));
    dispatch(addCategory(category));
    setPage(0);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newFeed = [...localFeed];
    const [movedItem] = newFeed.splice(fromIndex, 1);
    newFeed.splice(toIndex, 0, movedItem);
    setLocalFeed(newFeed);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Update local feed when feed changes
  if (feed.length > 0 && localFeed.length === 0) {
    setLocalFeed(feed);
  }

  // Show loading state
  if (loading) {
    return (
      <section className="mb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {variant === "trending" ? "Trending News" : "Top News"}
          </h2>
          <div className="flex justify-center py-20">
            <LoadingSpinner
              size="lg"
              text={
                variant === "trending"
                  ? "Loading trending content..."
                  : "Loading news..."
              }
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        {variant === "default" && (
          <motion.h2
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Top News
          </motion.h2>
        )}

        {/* Category Buttons */}
        {variant === "default" && (
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={clsx(
                  "text-sm px-3 py-1.5 rounded-full border transition-colors",
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {cat[0].toUpperCase() + cat.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          <AnimatePresence mode="wait">
            {paginatedFeed.length === 0 ? (
              <motion.p
                key="no-content"
                className="text-gray-600 dark:text-gray-300 col-span-full text-center py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                No content found.
              </motion.p>
            ) : (
              paginatedFeed.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                  }}
                >
                  <DraggableNewsCard
                    item={item}
                    index={index}
                    onReorder={handleReorder}
                    isDragging={draggedIndex === index}
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        <motion.div
          className="flex justify-end items-center gap-3 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!expanded ? (
            <motion.button
              onClick={() => setExpanded(true)}
              className="text-sm px-3 py-1.5 bg-white text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Expand
            </motion.button>
          ) : (
            <>
              {page > 0 ? (
                <motion.button
                  onClick={() => setPage(page - 1)}
                  className="text-sm px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    setExpanded(false);
                    setPage(0);
                  }}
                  className="text-sm px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-700 dark:text-white rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Collapse
                </motion.button>
              )}
              {page < totalPages - 1 && (
                <motion.button
                  onClick={() => setPage(page + 1)}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded hover:bg-blue-500 dark:hover:bg-blue-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next
                </motion.button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
