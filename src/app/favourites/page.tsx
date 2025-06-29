"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import NewsCard from "@/components/cards/NewsCard";
import { useAppSelector } from "@/redux/hook";
import { useLoadContent } from "@/features/content/useLoadContent";
import Loader from "@/components//Loader"; 

export default function FavouritesPage() {
  useLoadContent(); // Ensure feed is loaded

  const feed = useAppSelector((state) => state.content.feed);

  if (feed.length === 0) {
    return (
      <DashboardLayout>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Your Favourites
        </h2>
        <Loader /> 
      </DashboardLayout>
    );
  }

  const favourites = feed.filter((item) => item.isFavourite);

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Your Favourites
      </h2>

      {favourites.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          You haven’t added any favourites yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
