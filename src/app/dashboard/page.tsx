import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading Dashboard..." />}>
      <DashboardClient />
    </Suspense>
  );
}
