"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type HeaderProps = {
  onSearchChange: (value: string) => void;
};

export default function Header({ onSearchChange }: HeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const defaultDark = theme === "dark" || (!theme && darkQuery.matches);
    setIsDark(defaultDark);
    updateHtmlClass(defaultDark);
    setMounted(true);
  }, []);

  const updateHtmlClass = (dark: boolean) => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    updateHtmlClass(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <header className="w-full px-6 py-4 border-b bg-white dark:bg-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
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
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="p-2 rounded-full bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600">
          <span role="img" aria-label="⚙️">
            ⚙️
          </span>
        </button>
      </div>
    </header>
  );
}
