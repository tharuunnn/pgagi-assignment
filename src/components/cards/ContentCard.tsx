"use client";

import { ContentItem, toggleFavourite } from "@/features/content/contentSlice";
import { useAppDispatch } from "@/redux/hook";
import clsx from "clsx";
import { Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ContentCard({ item }: { item: ContentItem }) {
  const dispatch = useAppDispatch();

  const handleFavourite = () => {
    dispatch(toggleFavourite(item.id));
  };

  return (
    <div className="rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={item.image || "/placeholder.png"}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white line-clamp-2">
            {item.title}
          </h3>
          <button
            onClick={handleFavourite}
            className={clsx(
              "p-1 rounded-full",
              item.isFavourite
                ? "text-red-500"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <Heart fill={item.isFavourite ? "currentColor" : "none"} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {item.description}
        </p>

        <div className="mt-2">
          <Link
            href={item.url}
            target="_blank"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {item.type === "spotify" ? (
              <>
                <Play size={16} className="mr-1" /> Play Now
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
