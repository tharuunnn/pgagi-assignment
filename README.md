# PGAGI Assignment

A modern, full-stack dashboard application built with Next.js, React, Redux Toolkit, and TypeScript. The dashboard aggregates trending news, Spotify music, and YouTube music videos, with a focus on interactivity, personalization, and a clean user experience.

## Features

- **Personalized Dashboard**: Combines trending news, Spotify top tracks, and YouTube trending music in a single interface.
- **Drag & Drop**: Reorder news, Spotify, and YouTube cards using drag-and-drop (powered by `@dnd-kit`).
- **Favourites**: Mark any news or music item as a favourite for quick access.
- **Category Filtering**: Filter news by category (technology, sports, health, entertainment, etc.).
- **Search**: Real-time search across all content types.
- **Spotify Integration**: Authenticated users can play, pause, and reorder their top Spotify tracks directly from the dashboard.
- **YouTube Trending**: Browse and reorder trending music videos from YouTube.
- **Trending Tab**: See what's hot globally, with toggles for news and music.
- **Responsive & Dark Mode**: Fully responsive layout with dark mode support.
- **State Management**: Uses Redux Toolkit for robust, scalable state management.
- **API Layer**: Secure server-side API routes for news, Spotify, and YouTube data fetching.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **State**: Redux Toolkit, React Redux
- **Auth**: NextAuth.js (Spotify OAuth)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **APIs**: NewsAPI, Spotify Web API, YouTube Data API v3

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Set up environment variables:**

   - Copy `.env.example` to `.env.local` and fill in your API keys for NewsAPI, Spotify, and YouTube.

3. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

   **Note:** When you load the app, it will automatically redirect you to the dashboard.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

You must create a `.env.local` file in the project root with the following variables:

- `NEWS_API_KEY` – Your [NewsAPI](https://newsapi.org/) key. Sign up at newsapi.org and generate an API key.
- `YOUTUBE_API_KEY` – Your [YouTube Data API v3](https://console.developers.google.com/apis/library/youtube.googleapis.com) key. Create a project in Google Cloud Console, enable the YouTube Data API v3, and generate an API key.
- `SPOTIFY_CLIENT_ID` – Your [Spotify Developer](https://developer.spotify.com/dashboard/applications) client ID. Create an app in the Spotify Developer Dashboard.
- `SPOTIFY_CLIENT_SECRET` – Your Spotify Developer client secret. Get this from the same app as above.
- `NEXTAUTH_SECRET` – A random string used by [NextAuth.js](https://next-auth.js.org/configuration/options#secret) for session encryption. You can generate one with `openssl rand -base64 32` or use any long random value.

**Important:** For Spotify authentication to work, you must set the Redirect URI in your Spotify Developer Dashboard to `http://127.0.0.1:3000/api/auth/callback/spotify` (not `localhost`).

**All of these are required for the app to function.**

## Project Structure

```
src/
  app/           # Next.js app directory (routing, pages, layout)
  components/    # Reusable UI components (cards, layout, sections)
  features/      # Feature logic (content, spotify, API hooks)
  lib/           # Utility libraries (caching, fetch helpers)
  pages/api/     # API routes (news, trending, auth, etc.)
  redux/         # Redux store, hooks, and providers
  preferences/   # User preferences slice
  types/         # TypeScript type definitions
public/          # Static assets
__tests__/       # Placeholder for unit/integration tests
cypress/         # Cypress E2E tests
```

## API & Integrations

- **News**: `/api/news` (server-side, uses NewsAPI)
- **Trending News**: `/api/trending`
- **Spotify**: Auth via NextAuth, fetches user top tracks, playback via Spotify Web Playback SDK
- **YouTube**: `/api/trending-yt` (server-side, uses YouTube Data API v3)

## Dependencies

See `package.json` for the full list. Key dependencies include:

- `next`, `react`, `redux`, `@reduxjs/toolkit`, `next-auth`, `@dnd-kit/core`, `framer-motion`, `axios`, `tailwindcss`, `typescript`

## Notes

- You must provide your own API keys for NewsAPI, Spotify, and YouTube in your environment variables.
- The app is designed for extensibility and can be adapted for other content sources or widgets.
