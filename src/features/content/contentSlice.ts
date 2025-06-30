import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as contentAPI from "./contentAPI";

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  category: string;
  type: "article" | "spotify";
  isFavourite?: boolean;
}

export interface ContentState {
  feed: ContentItem[];
  trendingFeed: ContentItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchTerm: string;
  canFetchMoreNews: boolean;
  canFetchMoreTrending: boolean;
  newsApiPage: number;
  trendingApiPage: number;
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

// 🔹 Initial state
const initialState: ContentState = {
  feed: [],
  trendingFeed: [],
  status: "idle",
  error: null,
  searchTerm: "",
  canFetchMoreNews: true,
  canFetchMoreTrending: true,
  newsApiPage: 1,
  trendingApiPage: 1,
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
      state.feed = action.payload.map((item) => ({
        ...item,
        isFavourite: favouriteIds.has(item.id),
      }));
    },

    setTrendingFeed(state, action: PayloadAction<ContentItem[]>) {
      const favouriteIds = loadFavouriteIds();
      state.trendingFeed = action.payload.map((item) => ({
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
      toggleInList(state.trendingFeed);

      const allItems = [...state.feed, ...state.trendingFeed];
      const newFavourites = Array.from(
        new Set(allItems.filter((i) => i.isFavourite).map((i) => i.id))
      );

      localStorage.setItem("favourites", JSON.stringify(newFavourites));
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newArticles = action.payload;
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
        const newArticles = action.payload;
        if (action.meta.arg.page === 1) {
          state.trendingFeed = newArticles;
        } else {
          state.trendingFeed = [...state.trendingFeed, ...newArticles];
        }
        state.canFetchMoreTrending = newArticles.length > 0;
        state.trendingApiPage = action.meta.arg.page;
      })
      .addCase(fetchTrendingNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export const { setFeed, setTrendingFeed, toggleFavourite, setSearchTerm } =
  contentSlice.actions;

export default contentSlice.reducer;
