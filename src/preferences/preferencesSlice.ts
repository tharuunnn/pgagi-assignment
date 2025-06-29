import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PreferencesState = {
  categories: string[];      // Categories that have been activated/fetched
  activeCategory: string;    // Current selected tab
  darkMode: boolean;
};

const initialState: PreferencesState = {
  categories: ["all"],       // ✅ Start with 'all'
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

      // ✅ If switching away from 'all', replace it
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
  },
});

export const {
  setCategories,
  addCategory,
  setActiveCategory,
  toggleDarkMode,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
