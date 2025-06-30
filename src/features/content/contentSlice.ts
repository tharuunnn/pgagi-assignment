import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as contentAPI from "./contentAPI";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  category: string;
  type: "article" | "spotify" | "news";
  isFavourite?: boolean;
}

export interface ContentState {
  feed: ContentItem[];
  trendingNewsFeed: ContentItem[];
  trendingSongsFeed: ContentItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchTerm: string;
  canFetchMoreNews: boolean;
  canFetchMoreTrendingNews: boolean;
  canFetchMoreTrendingSongs: boolean;
  newsApiPage: number;
  trendingNewsApiPage: number;
  trendingSongsApiPage: number;
  fetchedCategories: string[];
}

// 🔹 Load favourites from localStorage
const loadFavouriteIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("favourites");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Helper: Load favourite news articles from localStorage
const loadFavouriteNewsArticles = (): ContentItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("favouriteNewsArticles");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// 🔹 Initial state
const initialState: ContentState = {
  feed: [],
  trendingNewsFeed: [],
  trendingSongsFeed: [],
  status: "idle",
  error: null,
  searchTerm: "",
  canFetchMoreNews: true,
  canFetchMoreTrendingNews: true,
  canFetchMoreTrendingSongs: true,
  newsApiPage: 1,
  trendingNewsApiPage: 1,
  trendingSongsApiPage: 1,
  fetchedCategories: [],
};

// 🔹 Thunk: Fetch news for a specific category
export const fetchNews = createAsyncThunk(
  "content/fetchNews",
  async ({ categories, page }: { categories: string[]; page: number }) => {
    const articles = await contentAPI.fetchNews(categories, page);
    return articles;
  }
);

// 🔹 Thunk: Fetch trending news (based on popularity or headlines)
export const fetchTrendingNews = createAsyncThunk(
  "content/fetchTrendingNews",
  async ({ page }: { page: number }) => {
    const res = await fetch(`/api/trending?page=${page}`);
    const articles = await res.json();
    return articles;
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setFeed(state, action: PayloadAction<ContentItem[]>) {
      const favouriteIds = loadFavouriteIds();
      const favouriteArticles = loadFavouriteNewsArticles();
      // Merge API articles with favourited articles from localStorage
      const merged = [
        ...action.payload,
        ...favouriteArticles.filter(
          (fav) => !action.payload.some((item) => item.id === fav.id)
        ),
      ];
      state.feed = merged.map((item) => ({
        ...item,
        isFavourite:
          favouriteIds.has(item.id) ||
          favouriteArticles.some((fav) => fav.id === item.id),
        type: "news",
      }));
    },

    setTrendingNewsFeed(state, action: PayloadAction<ContentItem[]>) {
      const favouriteIds = loadFavouriteIds();
      const favouriteArticles = loadFavouriteNewsArticles();
      // Merge API articles with favourited articles from localStorage
      const merged = [
        ...action.payload,
        ...favouriteArticles.filter(
          (fav) => !action.payload.some((item) => item.id === fav.id)
        ),
      ];
      state.trendingNewsFeed = merged.map((item) => ({
        ...item,
        isFavourite:
          favouriteIds.has(item.id) ||
          favouriteArticles.some((fav) => fav.id === item.id),
        type: "news",
      }));
    },

    setTrendingSongsFeed(state, action: PayloadAction<ContentItem[]>) {
      const favouriteIds = loadFavouriteIds();
      state.trendingSongsFeed = action.payload.map((item) => ({
        ...item,
        isFavourite: favouriteIds.has(item.id),
      }));
    },

    toggleFavourite(state, action: PayloadAction<string>) {
      const toggleInList = (list: ContentItem[]) => {
        const item = list.find((i) => i.id === action.payload);
        if (item) item.isFavourite = !item.isFavourite;
      };

      toggleInList(state.feed);
      toggleInList(state.trendingNewsFeed);
      toggleInList(state.trendingSongsFeed);

      const allItems = [
        ...state.feed,
        ...state.trendingNewsFeed,
        ...state.trendingSongsFeed,
      ];
      const newFavourites = Array.from(
        new Set(allItems.filter((i) => i.isFavourite).map((i) => i.id))
      );
      localStorage.setItem("favourites", JSON.stringify(newFavourites));

      // --- News Favourites: Robustly store/remove full article for news ---
      // Load current favouriteNewsArticles
      let favouriteNewsArticles = loadFavouriteNewsArticles();
      // Find the toggled article in all feeds
      const toggledArticle = allItems.find(
        (i) => i.id === action.payload && i.type !== "spotify"
      );
      if (toggledArticle) {
        if (toggledArticle.isFavourite) {
          // Add if not already present
          if (!favouriteNewsArticles.some((a) => a.id === toggledArticle.id)) {
            favouriteNewsArticles.push({ ...toggledArticle, type: "news" });
          }
        } else {
          // Remove if present
          favouriteNewsArticles = favouriteNewsArticles.filter(
            (a) => a.id !== toggledArticle.id
          );
        }
        localStorage.setItem(
          "favouriteNewsArticles",
          JSON.stringify(favouriteNewsArticles)
        );
      }
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },

    clearTrendingNewsFeed(state) {
      state.trendingNewsFeed = [];
    },

    clearTrendingSongsFeed(state) {
      state.trendingSongsFeed = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const favouriteIds = loadFavouriteIds();
        const newArticles = action.payload.map((item: ContentItem) => ({
          ...item,
          isFavourite: favouriteIds.has(item.id),
        }));
        if (action.meta.arg.page === 1) {
          state.feed = newArticles;
        } else {
          state.feed = [...state.feed, ...newArticles];
        }
        state.canFetchMoreNews = newArticles.length > 0;
        state.newsApiPage = action.meta.arg.page;

        const fetchedCats = action.meta.arg.categories;

        if (fetchedCats.length > 1) {
          // This was the initial "all" fetch
          state.fetchedCategories.push("all", ...fetchedCats);
        } else if (fetchedCats.length === 1) {
          // This was a fetch for a single category
          const category = fetchedCats[0];
          if (!state.fetchedCategories.includes(category)) {
            state.fetchedCategories.push(category);
          }
        }
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(fetchTrendingNews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTrendingNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const favouriteIds = loadFavouriteIds();
        const newArticles = action.payload.map((item: ContentItem) => ({
          ...item,
          isFavourite: favouriteIds.has(item.id),
        }));
        if (action.meta.arg.page === 1) {
          state.trendingNewsFeed = newArticles;
        } else {
          state.trendingNewsFeed = [...state.trendingNewsFeed, ...newArticles];
        }
        state.canFetchMoreTrendingNews = newArticles.length > 0;
        state.trendingNewsApiPage = action.meta.arg.page;
      })
      .addCase(fetchTrendingNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export const {
  setFeed,
  setTrendingNewsFeed,
  setTrendingSongsFeed,
  toggleFavourite,
  setSearchTerm,
  clearTrendingNewsFeed,
  clearTrendingSongsFeed,
} = contentSlice.actions;

export default contentSlice.reducer;
