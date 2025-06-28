import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ContentItem {
  id: string
  type: 'news' | 'spotify'
  title: string
  description: string
  image: string
  url: string
  isFavorite?: boolean
}

interface ContentState {
  feed: ContentItem[]
  favorites: ContentItem[]
}

const initialState: ContentState = {
  feed: [],
  favorites: [],
}

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setFeed(state, action: PayloadAction<ContentItem[]>) {
      state.feed = action.payload
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const item = state.feed.find((i) => i.id === action.payload)
      if (!item) return

      item.isFavorite = !item.isFavorite

      if (item.isFavorite) {
        state.favorites.push(item)
      } else {
        state.favorites = state.favorites.filter((i) => i.id !== item.id)
      }
    },
  },
})

export const { setFeed, toggleFavorite } = contentSlice.actions
export default contentSlice.reducer

//manages the content state - feed, trending, favourites