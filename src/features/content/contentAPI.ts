import axios from "axios";
import { ContentItem } from "./contentSlice";
/**
 * Fetches news from your internal API route (`/api/news`) using the provided categories.
 * This keeps the News API key securely on the server.
 */
export async function fetchNews(
  categories: string[],
  page: number
): Promise<ContentItem[]> {
  try {
    const response = await axios.get("/api/news", {
      params: {
        categories: categories.join(","),
        page,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    // Re-throw the error to be caught by the Redux thunk
    throw error;
  }
}
