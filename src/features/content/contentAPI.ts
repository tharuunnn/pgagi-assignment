import axios from "axios";
import { ContentItem } from "./contentSlice";

const NEWS_API_KEY = "5a7ba47c0afe47719f7e0048048ef172";

export async function fetchNews(categories: string[]): Promise<ContentItem[]> {
  try {
    const responses = await Promise.all(
      categories.map((category) =>
        axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            country: "us",
            apiKey: NEWS_API_KEY,
          },
        }).then((res) => ({
          articles: res.data.articles,
          category, // 🧠 inject the request category here
        }))
      )
    );

    const allArticles: ContentItem[] = responses.flatMap(({ articles, category }) =>
      articles.map((article, idx) => ({
        id: `${article.title}-${idx}`,
        type: "news",
        title: article.title,
        description: article.description,
        image: article.urlToImage,
        url: article.url,
        isFavourite: false,
        category, // ✅ assigned from the API request
      }))
    );

    return allArticles;
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
}
