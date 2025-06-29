"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { toggleFavourite } from "@/features/content/contentSlice";
import {
  setActiveCategory,
  addCategory,
} from "@/preferences/preferencesSlice";
import { fetchNewsForCategory } from "@/features/content/contentSlice";
import clsx from "clsx";
import { Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NewsSection() {
  const dispatch = useAppDispatch();

  const feed = useAppSelector((state) => state.content.feed);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const fetchedCategories = useAppSelector(
    (state) => state.content.fetchedCategories
  );

  const activeCategory = useAppSelector(
    (state) => state.preferences.activeCategory
  );

  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = expanded ? 6 : 3;

  const allCategories = ["all", "technology", "sports", "health", "entertainment"];

  // Fetch the category's content if not already done
  useEffect(() => {
    if (activeCategory !== "all" && !fetchedCategories.includes(activeCategory)) {
      dispatch(fetchNewsForCategory(activeCategory));
    }
  }, [activeCategory, fetchedCategories, dispatch]);

  const filteredFeed = feed.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";

    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredFeed.length / itemsPerPage);
  const paginatedFeed = filteredFeed.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const handleFavourite = (id: string) => {
    dispatch(toggleFavourite(id));
  };

  const handleCategoryClick = (category: string) => {
    dispatch(setActiveCategory(category));
    dispatch(addCategory(category));
    setPage(0);
  };

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Top News
        </h2>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allCategories.map((cat) => (
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

        {/* Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {paginatedFeed.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No content found.</p>
          ) : (
            paginatedFeed.map((item) => (
              <div
                key={item.id}
                className="flex flex-col w-full max-w-sm mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full"
              >
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    width={400}
                    height={250}
                    className="object-cover rounded-t-xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
                      {item.title}
                    </h3>
                    <button
                      onClick={() => handleFavourite(item.id)}
                      className={clsx(
                        "p-1 rounded-full transition-colors",
                        item.isFavourite
                          ? "text-red-500"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      <Heart fill={item.isFavourite ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-2">
                    <Link
                      href={item.url}
                      target="_blank"
                      className="inline-flex items-center text-blue-700 dark:text-blue-400 font-medium hover:underline"
                    >
                      {item.type === "spotify" ? (
                        <>
                          <Play size={16} className="mr-1" />
                          Play Now
                        </>
                      ) : (
                        <>Read More</>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
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
