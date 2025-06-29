import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
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
  searchTerm: string;
  fetchedCategories: string[]; // ✅ To prevent refetch
}

// 🔹 Load saved favourites
const loadFavouriteIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem("favourites");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// 🔹 Initial State
const initialState: ContentState = {
  feed: [],
  searchTerm: "",
  fetchedCategories: [],
};

// ✅ Async thunk to fetch news for a single category
export const fetchNewsForCategory = createAsyncThunk(
  "content/fetchNewsForCategory",
  async (category: string) => {
    const articles = await fetchNews([category]);
    return { category, articles };
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

    toggleFavourite(state, action: PayloadAction<string>) {
      const item = state.feed.find((i) => i.id === action.payload);
      if (!item) return;

      item.isFavourite = !item.isFavourite;

      const newFavouriteIds = state.feed
        .filter((i) => i.isFavourite)
        .map((i) => i.id);

      localStorage.setItem("favourites", JSON.stringify(newFavouriteIds));
    },

    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchNewsForCategory.fulfilled, (state, action) => {
      const { category, articles } = action.payload;

      // Avoid duplicates
      const existingIds = new Set(state.feed.map((i) => i.id));
      const newArticles = articles.filter((a) => !existingIds.has(a.id));

      const favouriteIds = loadFavouriteIds();

      state.feed.push(
        ...newArticles.map((item) => ({
          ...item,
          isFavourite: favouriteIds.has(item.id),
        }))
      );

      // ✅ Add to fetched category tracker
      if (!state.fetchedCategories.includes(category)) {
        state.fetchedCategories.push(category);
      }
    });
  },
});

export const { setFeed, toggleFavourite, setSearchTerm } = contentSlice.actions;
export default contentSlice.reducer;
