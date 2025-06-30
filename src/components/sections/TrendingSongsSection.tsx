"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DraggableYouTubeCard from "../cards/DraggableYouTubeCard";

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

export default function TrendingSongsSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchVideos = async (token: string | null = null) => {
    let url = "/api/trending-yt";
    if (token) {
      url += `?pageToken=${token}`;
    }
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message || "Failed to fetch YouTube trending music"
      );
    }
    return res.json();
  };

  useEffect(() => {
    async function getInitialVideos() {
      try {
        setLoading(true);
        const data = await fetchVideos();
        setVideos(data.items);
        setNextPageToken(data.nextPageToken);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Could not load trending songs.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    getInitialVideos();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setVideos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageToken) return;

    try {
      setLoadingMore(true);
      const data = await fetchVideos(nextPageToken);
      setVideos((prevVideos) => [...prevVideos, ...data.items]);
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Could not load more songs.";
      toast.error(message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Trending Songs..." />;
  }

  const videoIds = videos.map((v) => v.id);

  return (
    <section className="mb-12">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={videoIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {videos.map((video) => (
                <DraggableYouTubeCard key={video.id} video={video} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
      {nextPageToken && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
