// pages/api/trending.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=technology&sortBy=popularity&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await response.json();

    const mapped = data.articles.map((article, index) => ({
      id: article.url || `trending-${index}`,
      title: article.title || "No title",
      image: article.urlToImage || "",
      url: article.url,
      type: "article",
      description: article.description || "",
      category: "trending",
    }));

    return res.status(200).json(mapped);
  } catch (error) {
    console.error("Trending API error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
