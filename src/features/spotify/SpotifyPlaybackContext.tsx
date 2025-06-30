"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SpotifyPlaybackContextType {
  currentTrackId: string | null;
  isPlaying: boolean;
  playTrack: (trackId: string, trackUri: string) => Promise<void>;
  pauseTrack: () => Promise<void>;
  togglePlay: (trackId: string, trackUri: string) => Promise<void>;
  playerReady: boolean;
}

const SpotifyPlaybackContext = createContext<
  SpotifyPlaybackContextType | undefined
>(undefined);

export function SpotifyPlaybackProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) {
      setPlayerReady(false);
      return;
    }

    // Initialize Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "PGAGI Web Player",
        getOAuthToken: (cb) => {
          cb(session.accessToken);
        },
        volume: 0.5,
      });

      // Error handling
      player.addListener("initialization_error", ({ message }) => {
        console.warn("Spotify player initialization error:", message);
        setPlayerReady(false);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.warn("Spotify authentication error:", message);
        setPlayerReady(false);
        // Don't throw error, just log it
      });

      player.addListener("account_error", ({ message }) => {
        console.warn("Spotify account error:", message);
        setPlayerReady(false);
      });

      player.addListener("playback_error", ({ message }) => {
        console.warn("Spotify playback error:", message);
      });

      // Playback status updates
      player.addListener("player_state_changed", (state) => {
        if (state) {
          setIsPlaying(!state.paused);
          setCurrentTrackId(state.track_window.current_track.id);
        } else {
          setIsPlaying(false);
          setCurrentTrackId(null);
        }
      });

      // Ready
      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setPlayer(player);
        setPlayerReady(true);
      });

      // Not Ready
      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setPlayerReady(false);
      });

      // Connect to the player
      player.connect().catch((error) => {
        console.warn("Failed to connect to Spotify player:", error);
        setPlayerReady(false);
      });
    };

    return () => {
      if (player) {
        player.disconnect();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [session?.accessToken]);

  const playTrack = async (trackId: string, trackUri: string) => {
    if (!session?.accessToken || !deviceId) {
      console.error("No session or device available");
      return;
    }

    try {
      // Set the device to our web player
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      });

      // Start playback
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [trackUri],
          }),
        }
      );

      setCurrentTrackId(trackId);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const pauseTrack = async () => {
    if (!session?.accessToken || !deviceId) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      setIsPlaying(false);
    } catch (error) {
      console.error("Error pausing track:", error);
    }
  };

  const togglePlay = async (trackId: string, trackUri: string) => {
    if (currentTrackId === trackId && isPlaying) {
      await pauseTrack();
    } else {
      await playTrack(trackId, trackUri);
    }
  };

  return (
    <SpotifyPlaybackContext.Provider
      value={{
        currentTrackId,
        isPlaying,
        playTrack,
        pauseTrack,
        togglePlay,
        playerReady,
      }}
    >
      {children}
    </SpotifyPlaybackContext.Provider>
  );
}

export function useSpotifyPlayback() {
  const context = useContext(SpotifyPlaybackContext);
  if (context === undefined) {
    throw new Error(
      "useSpotifyPlayback must be used within a SpotifyPlaybackProvider"
    );
  }
  return context;
}

// Add Spotify types to window
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}
