"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import NewsSection from "@/components/sections/NewsSection";
import TrendingSongsSection from "@/components/sections/TrendingSongsSection";
import { useLoadContent } from "@/features/content/useLoadContent";
import { AnimatePresence, motion } from "framer-motion";
import { Music, Newspaper } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useCallback, useState } from "react";

export default function TrendingPage() {
  useLoadContent();
  const { data: session, status } = useSession();
  const [showNews, setShowNews] = useState(true);

  const handleSearch = useCallback(() => {
    // Search functionality not needed for trending page
  }, []);

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
                onClick={() => setShowNews(true)}
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
                onClick={() => setShowNews(false)}
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
            What's trending in {showNews ? "news" : "music"} right now
          </p>
        </motion.div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {showNews ? (
            <motion.div
              key="news"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NewsSection variant="trending" />
            </motion.div>
          ) : (
            <motion.div
              key="songs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {status === "unauthenticated" ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Connect Spotify
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Connect your Spotify account to see trending songs
                  </p>
                  <button
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    onClick={() => signIn("spotify")}
                  >
                    Connect Spotify
                  </button>
                </motion.div>
              ) : (
                <TrendingSongsSection />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
