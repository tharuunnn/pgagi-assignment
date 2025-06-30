"use client";

import Loader from "@/components//Loader";
import NewsCard from "@/components/cards/NewsCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ContentItem } from "@/features/content/contentSlice";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useAppSelector } from "@/redux/hook";

export default function FavouritesPage() {
  useLoadContent(); // Ensure feed is loaded

  const { feed, trendingFeed } = useAppSelector((state) => state.content);

  if (feed.length === 0 && trendingFeed.length === 0) {
    return (
      <DashboardLayout>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Your Favourites
        </h2>
        <Loader />
      </DashboardLayout>
    );
  }

  const allItems = [...feed, ...trendingFeed];
  const uniqueFavourites = allItems.reduce((acc, current) => {
    if (current.isFavourite && !acc.find((item) => item.id === current.id)) {
      acc.push(current);
    }
    return acc;
  }, [] as ContentItem[]);

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Your Favourites
      </h2>

      {uniqueFavourites.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          You haven't added any favourites yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueFavourites.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
