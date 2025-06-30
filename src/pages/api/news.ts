// pages/api/news.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ContentItem } from "@/features/content/contentSlice"; // adjust if needed

const NEWS_API_KEY = process.env.NEWS_API_KEY!;

// In-memory cache
const cache: Record<string, ContentItem[]> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { categories } = req.query;

  if (!categories) {
    return res.status(400).json({ error: "Missing categories" });
  }

  const categoryList = Array.isArray(categories)
    ? categories
    : categories.split(",");

  // Create a consistent cache key
  const cacheKey = categoryList.sort().join(",");

  // 🔹 Return from cache if available
  if (cache[cacheKey]) {
    return res.status(200).json(cache[cacheKey]);
  }

  try {
    const results = await Promise.all(
      categoryList.map(async (category) => {
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            country: "us",
            apiKey: NEWS_API_KEY,
          },
        });

        return response.data.articles.map((article: any, idx: number): ContentItem => ({
          id: `${article.title}-${idx}`,
          type: "news",
          title: article.title,
          description: article.description,
          image: article.urlToImage,
          url: article.url,
          category,
          isFavourite: false,
        }));
      })
    );

    const allArticles = results.flat();

    // 🔹 Save to cache
    cache[cacheKey] = allArticles;

    res.status(200).json(allArticles);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
