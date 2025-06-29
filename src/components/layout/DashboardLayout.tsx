"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
  Header,
}: {
  Header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        {Header}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
