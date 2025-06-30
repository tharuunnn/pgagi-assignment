import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";
import TrendingClient from "./TrendingClient";

export default function TrendingPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Trending..." />}>
      <TrendingClient />
    </Suspense>
  );
}
