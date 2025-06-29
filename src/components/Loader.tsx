import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-40 text-gray-600 dark:text-gray-300">
      <Loader2 className="animate-spin mr-2 w-5 h-5" />
      Loading...
    </div>
  );
}
