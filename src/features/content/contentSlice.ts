import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchNews } from "./contentAPI";

export interface ContentItem {
  id: string;
  title: string;
  image: string;
  url: string;
  type: string;
  description: string;
  category: string;
  isFavourite?: boolean;
}

interface ContentState {
  feed: ContentItem[];
  trendingFeed: ContentItem[];
  searchTerm: string;
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
  searchTerm: "",
  fetchedCategories: [],
};

// 🔹 Thunk: Fetch news for a specific category
export const fetchNewsForCategory = createAsyncThunk(
  "content/fetchNewsForCategory",
  async (category: string) => {
    const articles = await fetchNews([category]);
    return { category, articles };
  }
);

// 🔹 Thunk: Fetch trending news (based on popularity or headlines)
export const fetchTrendingNews = createAsyncThunk(
  "content/fetchTrendingNews",
  async () => {
    const articles = await fetchNews([], true); // `true` signifies trending
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
    builder.addCase(fetchNewsForCategory.fulfilled, (state, action) => {
      const { category, articles } = action.payload;
      const existingIds = new Set(state.feed.map((i) => i.id));
      const favouriteIds = loadFavouriteIds();

      const newArticles = articles
        .filter((article) => !existingIds.has(article.id))
        .map((article) => ({
          ...article,
          isFavourite: favouriteIds.has(article.id),
        }));

      state.feed.push(...newArticles);

      if (!state.fetchedCategories.includes(category)) {
        state.fetchedCategories.push(category);
      }
    });

    builder.addCase(fetchTrendingNews.fulfilled, (state, action) => {
      const favouriteIds = loadFavouriteIds();
      state.trendingFeed = action.payload.map((item) => ({
        ...item,
        isFavourite: favouriteIds.has(item.id),
      }));
    });
  },
});

export const { setFeed, setTrendingFeed, toggleFavourite, setSearchTerm } =
  contentSlice.actions;

export default contentSlice.reducer;
