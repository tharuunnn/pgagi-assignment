import { getFromCache, setInCache } from "@/lib/cache";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { pageToken } = req.query;

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "YouTube API key is not configured" });
  }

  const cacheKey = "yt-trending-songs";
  const cachedData = getFromCache<any[]>(cacheKey);
  if (cachedData) {
    return res.status(200).json({ items: cachedData });
  }

  let url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=US&videoCategoryId=10&maxResults=12&key=${apiKey}`;
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error?.message || "Failed to fetch from YouTube API";
      return res.status(response.status).json({ message: errorMessage });
    }

    setInCache(cacheKey, (data.items || []).slice(0, 15));
    res.status(200).json({
      items: data.items || [],
      nextPageToken: data.nextPageToken,
    });
  } catch (error) {
    console.error("YouTube API route error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
