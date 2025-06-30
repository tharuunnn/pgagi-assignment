"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import TrendingNewsSection from "@/components/sections/NewsSection";
import TrendingSongsSection from "@/components/sections/TrendingSongsSection";
import { setSearchTerm } from "@/features/content/contentSlice";
import { useLoadTrending } from "@/features/content/useLoadTrending";
import { useAppDispatch } from "@/redux/hook";
import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import { Music, Newspaper } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TrendingClient() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useLoadTrending();

  const [showNews, setShowNews] = useState(
    searchParams?.get("view") !== "songs"
  );

  useEffect(() => {
    setShowNews(searchParams?.get("view") !== "songs");
  }, [searchParams]);

  const handleSearch = useCallback(
    debounce((value: string) => {
      dispatch(setSearchTerm(value));
    }, 300),
    [dispatch]
  );

  const handleToggle = (news: boolean) => {
    router.push(`${pathname}?view=${news ? "news" : "songs"}`);
  };

  return (
    <DashboardLayout Header={<Header onSearchChange={handleSearch} />}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header with Toggle */}
        <motion.div
          className="mb-8 ml-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending
            </h1>

            {/* Toggle Button */}
            <motion.div
              className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={() => handleToggle(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  showNews
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Newspaper size={16} />
                News
              </motion.button>
              <motion.button
                onClick={() => handleToggle(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !showNews
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Music size={16} />
                Songs
              </motion.button>
            </motion.div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            What the world is talking about
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {showNews ? (
            <TrendingNewsSection key="news" variant="trending" />
          ) : (
            <TrendingSongsSection key="songs" />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
