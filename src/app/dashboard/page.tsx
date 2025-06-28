"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ContentCard from "@/components/sections/NewsSection";
import SpotifySection from "@/components/sections/spotifySection";
import { setSearchTerm } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import debounce from "lodash.debounce";
import { signIn, useSession } from "next-auth/react";
import { useCallback } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  useLoadContent();
  const feed = useAppSelector((state) => state.content.feed);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);

  const filteredFeed = feed.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    return (
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase())
    );
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
      <div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search the feed..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2          lg:grid-cols-3 gap-6">
          {filteredFeed.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              Loading content...
            </p>
          ) : (
            filteredFeed.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))
          )}
        </div>
        {status === "unauthenticated" && (
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => signIn("spotify")}
          >
            Connect Spotify
          </button>
        )}

        {status === "authenticated" && (
          <div className="mt-4">
            <SpotifySection />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
