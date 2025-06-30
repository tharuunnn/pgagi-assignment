"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type HeaderProps = {
  onSearchChange: (value: string) => void;
};

export default function Header({ onSearchChange }: HeaderProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const isDarkMode = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDark(isDarkMode);
    updateHtmlClass(isDarkMode);
    setMounted(true);
  }, []);

  const updateHtmlClass = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    updateHtmlClass(next);
  };

  const handleDisconnect = () => {
    signOut({ callbackUrl: "/" });
  };

  if (!mounted) return null;

  return (
    <header className="w-full px-6 py-4 border-b bg-white dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm relative">
      {/* Search Input */}
      <div className="w-full md:w-1/2">
        <input
          type="text"
          placeholder="Search news content and tracks..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 text-black dark:text-white"
        />
      </div>

      {/* Dark Mode + Settings */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Settings
                  </h3>

                  {session?.user ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.user.name || "User"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {session.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Disconnect Button */}
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <LogOut size={16} />
                        Disconnect Spotify
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        Not connected to Spotify
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Backdrop to close settings */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </header>
  );
}
