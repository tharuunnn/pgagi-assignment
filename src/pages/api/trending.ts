// pages/api/trending.ts
import { getFromCache, setInCache } from "@/lib/cache";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import { NextApiRequest, NextApiResponse } from "next";

interface Article {
  title: string;
  url: string;
  urlToImage: string;
  description: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cacheKey = "news-trending";
  const cachedData = getFromCache<Article[]>(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const page = req.query.page || "1";

  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  if (!NEWS_API_KEY) {
    return res.status(500).json({ error: "News API key not configured" });
  }

  const url =
    `https://newsapi.org/v2/everything?q=technology&sortBy=popularity&pageSize=20&page=${page}&apiKey=` +
    NEWS_API_KEY;

  try {
    const response = await fetchWithRetry(() => fetch(url));

    const data = await response.json();

    if (!response.ok) {
      console.error("No articles returned from NewsAPI", data);
      return res
        .status(500)
        .json({ error: "Trending API returned no articles" });
    }

    if (!data.articles || !Array.isArray(data.articles)) {
      console.error("No articles returned from NewsAPI", data);
      return res
        .status(500)
        .json({ error: "Trending API returned no articles" });
    }

    const mapped = data.articles.map((article: Article, index: number) => ({
      id: article.url || `trending-${index}`,
      title: article.title || "No title",
      image: article.urlToImage || "",
      url: article.url,
      type: "article",
      description: article.description || "",
      category: "trending",
    }));

    setInCache(cacheKey, mapped);
    res.status(200).json(mapped);
  } catch (error) {
    console.error("Trending API error:", error);
    res.status(500).json({ error: "Failed to fetch trending news" });
  }
}
