"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch } from "@/redux/hook";
import { Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function NewsCard({ item }: { item: ContentItem }) {
  const dispatch = useAppDispatch();

  const handleFavourite = () => {
    dispatch(toggleFavourite(item.id));
  };

  console.log("NewsCard item:", item);

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full">
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.title}
          width={400}
          height={250}
          className="object-cover rounded-t-xl"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2">
            {item.title}
          </h3>
          <button
            onClick={handleFavourite}
            className={clsx(
              "p-1 rounded-full transition-colors",
              item.isFavourite
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Heart fill={item.isFavourite ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {item.description}
        </p>
        <div className="mt-auto pt-2">
          <Link
            href={item.url}
            target="_blank"
            className="inline-flex items-center text-blue-700 dark:text-blue-400 font-medium hover:underline"
          >
            {item.type === "spotify" ? (
              <>
                <Play size={16} className="mr-1" />
                Play Now
              </>
            ) : (
              <>Read More</>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
