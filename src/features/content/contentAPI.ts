import { ContentItem } from "./contentSlice";
/**
 * Fetches news from your internal API route (`/api/news`) using the provided categories.
 * This keeps the News API key securely on the server.
 */
export async function fetchNews(categories: string[]): Promise<ContentItem[]> {
  try {
    const res = await fetch(`/api/news?categories=${categories.join(",")}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.status}`);
    }

    const data: ContentItem[] = await res.json();
    return data;
  } catch (err) {
    console.error("fetchNews error:", err);
    return [];
  }
}
