import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ContentItem {
  id: string;
  title: string;
  image: string;
  url: string;
  type: string;
  description: string;
  isFavourite?: boolean;
}

interface ContentState {
  feed: ContentItem[];
}

const loadFavouriteIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem("favourites");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const initialState: ContentState = {
  feed: [],
};

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
  },
});

export const { setFeed, toggleFavourite } = contentSlice.actions;
export default contentSlice.reducer;
