"use client";

import ContentCard from "@/components/cards/ContentCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAppSelector } from "@/redux/hook";

export default function FavouritesPage() {
  const favourites = useAppSelector((state) => state.content.feed).filter(
    (item) => item.isFavourite
  );

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
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
