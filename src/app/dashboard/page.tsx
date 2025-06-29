"use client";

import Header from "@/components/layout/Header";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NewsSection from "@/components/sections/NewsSection";
import SpotifySection from "@/components/sections/spotifySection";
import { setSearchTerm } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import debounce from "lodash.debounce";
import { signIn, useSession } from "next-auth/react";
import { useCallback } from "react";

export default function PersonalizedPage() {
  const { data: session, status } = useSession();
  useLoadContent();

  const feed = useAppSelector((state) => state.content.feed);
  const searchTerm = useAppSelector((state) => state.content.searchTerm);
  const dispatch = useAppDispatch();

  const handleSearch = useCallback(
    debounce((value: string) => {
      dispatch(setSearchTerm(value));
    }, 300),
    []
  );

  const filteredFeed = feed.filter((item) => {
    const title = item.title?.toLowerCase() || "";
    const description = item.description?.toLowerCase() || "";
    return (
      title.includes(searchTerm.toLowerCase()) ||
      description.includes(searchTerm.toLowerCase())
    );
  });

  

  return (
    <>
    <DashboardLayout Header={<Header onSearchChange={handleSearch} />}>
      {/* News Grid */}
      <NewsSection/>

      

      {/* Spotify Section */}
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
    </DashboardLayout>
    </>
  );
}