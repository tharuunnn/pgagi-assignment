import DashboardLayout from "@/components/layout/DashboardLayout";
import NewsSection from "@/components/sections/NewsSection";

export default function TrendingPage() {
  return(
    <DashboardLayout>
    <NewsSection variant="trending" />
    </DashboardLayout>
  ) 
}
