"use client";

import { Home, Flame, Star } from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Main page", href: "/dashboard", icon: <Home size={20} /> },
  { name: "Favourites", href: "/favourites", icon: <Star size={20} /> },
  { name: "Trending", href: "/trending", icon: <Flame size={20} /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 hidden md:flex flex-col p-4 bg-white dark:bg-gray-800 shadow-lg">
      <h1 className="text-xl font-bold text-blue-600 mb-6">📊 PGAGI</h1>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white transition"
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
