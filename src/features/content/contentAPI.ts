import axios from "axios";
import { ContentItem } from "./contentSlice";

const NEWS_API_KEY = "f099c6fba3d64174a7ec0564e3d647a9";

export async function fetchNews(categories: string[]): Promise<ContentItem[]> {
  try {
    const responses = await Promise.all(
      categories.map((category) =>
        axios.get(`https://newsapi.org/v2/top-headlines`, {
          params: {
            category,
            country: "in",
            apiKey: NEWS_API_KEY,
          },
        })
      )
    );

    const allArticles = responses.flatMap((res) => res.data.articles);

    return allArticles.map((article, idx) => ({
      id: `${article.title}-${idx}`,
      type: "news",
      title: article.title,
      description: article.description,
      image: article.urlToImage,
      url: article.url,
    }));
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
}

// 🧪 Mock Spotify Recommendations - this is hard coded for now set it up later with o auth 
export async function fetchSpotify(): Promise<ContentItem[]> {
  // This would typically involve auth + token fetching
  return [
    {
      id: "spotify-1",
      type: "spotify",
      title: "Mock Song - Artist Name",
      description: "A great track you might enjoy.",
      image: "https://via.placeholder.com/300x180",
      url: "https://open.spotify.com/",
    },
    {
      id: "spotify-2",
      type: "spotify",
      title: "Mock Movie - Director",
      description: "Critically acclaimed recommendation.",
      image: "https://via.placeholder.com/300x180",
      url: "https://open.spotify.com/",
    },
  ];
}
