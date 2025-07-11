//setting up a redux store 
// store the global state here and helps retrieve it 

import preferencesReducer from '@/preferences/preferencesSlice'
import { configureStore } from '@reduxjs/toolkit'
import contentReducer from '@/features/content/contentSlice'

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer, //key - slice of state , value - reducer function (how state is managed)
    content: contentReducer,
  },
}) //created a store 

export type RootState = ReturnType<typeof store.getState> // gives us root state 
export type AppDispatch = typeof store.dispatch //dispatch fn type for sending action to reducer
