"use client";

import ContentCard from "@/components/cards/ContentCard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLoadContent } from "@/features/content/useLoadContent";
import { useAppSelector } from "@/redux/hook";

export default function DashboardPage() {
  useLoadContent();
  const feed = useAppSelector((state) => state.content.feed);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feed.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">Loading content...</p>
        ) : (
          feed.map((item) => <ContentCard key={item.id} item={item} />)
        )}
      </div>
    </DashboardLayout>
  );
}
