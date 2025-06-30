// pages/api/news.ts
import { ContentItem } from "@/features/content/contentSlice"; // adjust if needed
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const NEWS_API_KEY = process.env.NEWS_API_KEY!;

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
}

// In-memory cache
const cache: { [key: string]: ContentItem[] } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { categories, page = "1" } = req.query;

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
    const results = [];
    for (const category of categoryList) {
      await new Promise((r) => setTimeout(r, 500)); // delay to avoid rate limit
      const response = await fetchWithRetry(() =>
        axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            country: "us",
            apiKey: NEWS_API_KEY,
            pageSize: 20,
            page,
          },
        })
      );
      if (!response.data.articles || !Array.isArray(response.data.articles)) {
        console.error("No articles returned from NewsAPI", response.data);
        return res.status(500).json({ error: "Failed to fetch articles" });
      }
      results.push(
        response.data.articles.map(
          (article: Article, idx: number): ContentItem => ({
            id: `${article.title}-${idx}`,
            type: "article",
            title: article.title,
            description: article.description,
            image: article.urlToImage,
            url: article.url,
            category,
            isFavourite: false,
          })
        )
      );
    }
    const flattenedResults = results.flat();

    cache[cacheKey] = flattenedResults;

    res.status(200).json(flattenedResults);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
