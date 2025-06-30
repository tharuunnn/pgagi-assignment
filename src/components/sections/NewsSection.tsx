"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchNews, fetchTrendingNews } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useLoadTrending } from "@/features/content/useLoadTrending";
import { setActiveCategory } from "@/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DraggableNewsCard from "../cards/DraggableNewsCard";

type NewsSectionProps = {
  variant?: "default" | "trending";
};

export default function NewsSection({ variant = "default" }: NewsSectionProps) {
  const dispatch = useAppDispatch();

  // Call hooks unconditionally at the top level
  useLoadContent();
  useLoadTrending();

  const feed = useAppSelector((state) => state.content.feed);
  const trendingFeed = useAppSelector((state) => state.content.trendingFeed);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const activeCategory = useAppSelector(
    (state) => state.preferences.activeCategory
  );
  const canFetchMoreNews = useAppSelector(
    (state) => state.content.canFetchMoreNews
  );
  const canFetchMoreTrending = useAppSelector(
    (state) => state.content.canFetchMoreTrending
  );
  const newsApiPage = useAppSelector((state) => state.content.newsApiPage);
  const trendingApiPage = useAppSelector(
    (state) => state.content.trendingApiPage
  );
  const status = useAppSelector((state) => state.content.status);

  useEffect(() => {
    if (status === "failed") {
      toast.error("API is busy, please try again later.");
    }
  }, [status]);

  const currentFeed = variant === "trending" ? trendingFeed : feed;
  const canFetchMore =
    variant === "trending" ? canFetchMoreTrending : canFetchMoreNews;
  const apiPage = variant === "trending" ? trendingApiPage : newsApiPage;

  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [localFeed, setLocalFeed] = useState(currentFeed);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const itemsPerPage = expanded ? 6 : 3;
  const paginatedFeed = localFeed.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  useEffect(() => {
    const filtered = currentFeed.filter((item) => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        variant === "trending"
          ? true
          : activeCategory === "all" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    setLocalFeed(filtered);
  }, [currentFeed, searchTerm, activeCategory, variant]);

  const handleCategoryClick = (category: string) => {
    dispatch(setActiveCategory(category));
    setPage(0);
  };

  const handleExpandToggle = () => {
    setExpanded(!expanded);
    setPage(0);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const reorderedGlobalIndex = page * itemsPerPage + fromIndex;
    const newFeed = [...localFeed];
    const [movedItem] = newFeed.splice(reorderedGlobalIndex, 1);
    newFeed.splice(page * itemsPerPage + toIndex, 0, movedItem);
    setLocalFeed(newFeed);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnd = () => setDraggedIndex(null);

  const handleNextPage = () => {
    const nextClientPage = page + 1;
    const isLastPageOfCurrentData =
      (nextClientPage + 1) * itemsPerPage > localFeed.length;

    if (isLastPageOfCurrentData && canFetchMore) {
      if (variant === "trending") {
        dispatch(fetchTrendingNews({ page: apiPage + 1 }));
      } else {
        dispatch(
          fetchNews({
            categories: [activeCategory],
            page: apiPage + 1,
          })
        );
      }
    }
    setPage(nextClientPage);
  };
  const loading = status === "loading" && localFeed.length === 0;

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
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {variant === "trending" ? "Trending News" : "Top News"}
        </motion.h2>

        {variant === "default" && (
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {["all", "technology", "sports", "health", "entertainment"].map(
              (cat) => (
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
                >
                  {cat[0].toUpperCase() + cat.slice(1)}
                </motion.button>
              )
            )}
          </motion.div>
        )}

        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedFeed.map((item, index) => (
              <DraggableNewsCard
                key={item.id}
                item={item}
                index={index}
                onReorder={handleReorder}
                isDragging={draggedIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </AnimatePresence>
        <div className="flex justify-center items-center mt-8 gap-4">
          {localFeed.length > 3 && (
            <button
              onClick={handleExpandToggle}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
          {expanded && (
            <>
              <motion.button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleNextPage}
                disabled={
                  page * itemsPerPage >= localFeed.length - itemsPerPage &&
                  !canFetchMore
                }
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </motion.button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
