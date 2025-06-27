"use client";

export default function Header() {
  return (
    <header className="w-full px-6 py-4 border-b bg-white dark:bg-gray-800 flex items-center justify-between shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h2>
      <div className="flex items-center gap-4">
        {/* Placeholder for dark mode toggle, search, user menu */}
        <button className="p-2 rounded-full bg-blue-100 dark:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600">
          <span role="img" aria-label="⚙️">
            ⚙️
          </span>
        </button>
      </div>
    </header>
  );
}
