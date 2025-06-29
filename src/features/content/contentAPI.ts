import axios from "axios";
import { ContentItem } from "./contentSlice";

// 🔐 Move this to .env.local if you haven't already
const NEWS_API_KEY = process.env.NEWS_API_KEY!;

// 💤 Delay between requests to avoid 429
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🧠 Simple session cache
const cachedNews: { [key: string]: ContentItem[] } = {};

export async function fetchNews(categories: string[]): Promise<ContentItem[]> {
  const cacheKey = categories.sort().join(",");

  // ✅ Use cache if available
  if (cachedNews[cacheKey]) {
    return cachedNews[cacheKey];
  }

  const allArticles: ContentItem[] = [];

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];

    try {
      const res = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category,
          country: "us",
          apiKey: NEWS_API_KEY,
        },
      });

      const articles = res.data.articles;

      const formatted = articles.map((article, idx) => ({
        id: `${article.title}-${idx}`,
        type: "news",
        title: article.title,
        description: article.description,
        image: article.urlToImage,
        url: article.url,
        isFavourite: false,
        category,
      }));

      allArticles.push(...formatted);
    } catch (err) {
      console.error(`Error fetching category ${category}:`, err);
    }

    // 🕒 Respect NewsAPI rate limit
    if (i < categories.length - 1) {
      await sleep(1100); // 1.1 sec delay
    }
  }

  // 💾 Cache and return
  cachedNews[cacheKey] = allArticles;
  return allArticles;
}
