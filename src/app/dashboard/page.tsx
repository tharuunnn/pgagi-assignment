"use client";

import ContentCard from "@/components/cards/ContentCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { setSearchTerm } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import debounce from "lodash.debounce";
import { useCallback } from "react";

export default function DashboardPage() {
  useLoadContent();
  const feed = useAppSelector((state) => state.content.feed);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);

  const filteredFeed = feed.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    return title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
  });

  const dispatch = useAppDispatch();

  const handleSearch = useCallback(
    debounce((value: string) => {
      dispatch(setSearchTerm(value));
    }, 300),
    []
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search the feed..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeed.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">Loading content...</p>
        ) : (
          filteredFeed.map((item) => <ContentCard key={item.id} item={item} />)
        )}
      </div>
    </DashboardLayout>
  );
}
