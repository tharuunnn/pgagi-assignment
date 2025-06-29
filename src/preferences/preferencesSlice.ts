import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreferencesState = {
  categories: string[];      // Categories that have been activated/fetched
  activeCategory: string;    // Current selected tab
  darkMode: boolean;
};

const initialState: PreferencesState = {
  categories: ["technology", "sports", "health", "entertainment"],     
  activeCategory: "all",
  darkMode: false,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<string[]>) {
      state.categories = action.payload;
    },
    addCategory(state, action: PayloadAction<string>) {
      const cat = action.payload;

      if (state.categories.includes("all") && cat !== "all") {
        state.categories = [cat];
      } else if (!state.categories.includes(cat)) {
        state.categories.push(cat);
      }
    },
    setActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
    state.darkMode = action.payload;
    }
  },
});

export const {
  setCategories,
  addCategory,
  setActiveCategory,
  toggleDarkMode,
  setDarkMode,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
