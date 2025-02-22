import { useQuery } from "@tanstack/react-query";
import { GameData } from "../types";
import { useEffect, useState } from "react";
import {
  fetchCustomGame,
  fetchCustomGameChoices,
  fetchMainGame,
  fetchMainGameChoices,
} from "../api/game";
import { initializeGameStorage } from "../utils/user.utils";

/**
 * Fetch the main game track and choices.
 */
export const useFetchMainPlaylist = () => {
  const [data, setData] = useState<GameData>({
    song: "",
    artists: [],
    id: 0,
    trackPreview: "",
    albumCover: "",
    externalUrl: "",
    tracklist: [],
  });

  const mainGameQuery = useQuery({
    queryKey: ["main", "track"],
    queryFn: fetchMainGame,
  });

  /**
   * Fetch the main game track and update local state.
   */
  useEffect(() => {
    if (mainGameQuery.data) {
      initializeGameStorage();

      const { song, artists, id, trackPreview, albumCover, externalUrl } =
        mainGameQuery.data;
      setData((prevState) => ({
        ...prevState,
        song,
        artists,
        id,
        trackPreview,
        albumCover,
        externalUrl,
      }));
    }
  }, [mainGameQuery.data, setData]);

  const mainGameChoicesQuery = useQuery({
    queryKey: ["main", "choices"],
    queryFn: fetchMainGameChoices,
  });

  /**
   * Fetch the main game choices and update local state.
   */
  useEffect(() => {
    if (mainGameChoicesQuery.data) {
      const { tracklist } = mainGameChoicesQuery.data;
      setData((prevState) => ({
        ...prevState,
        tracklist,
      }));
    }
  }, [mainGameChoicesQuery.data, setData]);

  return {
    data,
    isLoading: mainGameQuery.isLoading || mainGameChoicesQuery.isLoading,
    error: mainGameQuery.error || mainGameChoicesQuery.error,
  };
};

/**
 * Fetch the custom game track and choices.
 *
 * @param playlist the playlist id
 * @param r the reload flag
 */
export const useFetchCustomPlaylist = (
  playlist: string | null,
  r: string | null
) => {
  const [data, setData] = useState<
    GameData & { validPlaylist: boolean; playlistId: string }
  >({
    validPlaylist: false,
    playlistId: "",
    song: "",
    artists: [],
    id: 0,
    trackPreview: "",
    albumCover: "",
    externalUrl: "",
    tracklist: [],
  });

  const customGameQuery = useQuery({
    queryKey: ["custom", "playlist", playlist, "track"],
    queryFn: async () => fetchCustomGame({ playlist, r: r === "1" }),
  });

  /**
   * Fetch the main game track and update local state.
   */
  useEffect(() => {
    if (customGameQuery.data) {
      initializeGameStorage();

      const { song, artists, id, trackPreview, albumCover, externalUrl } =
        customGameQuery.data;
      setData((prevState) => ({
        ...prevState,
        validPlaylist: true,
        playlistId: playlist as string,
        song,
        artists,
        id,
        trackPreview,
        albumCover,
        externalUrl,
      }));
    }
  }, [customGameQuery.data, playlist, setData]);

  const customGameChoicesQuery = useQuery({
    queryKey: ["custom", "playlist", playlist, "choices"],
    queryFn: async () => fetchCustomGameChoices(playlist),
  });

  /**
   * Fetch the main game choices and update local state.
   */
  useEffect(() => {
    if (customGameChoicesQuery.data) {
      const { tracklist } = customGameChoicesQuery.data;
      setData((prevState) => ({
        ...prevState,
        tracklist,
      }));
    }
  }, [customGameChoicesQuery.data, setData]);

  return {
    data,
    isLoading: customGameQuery.isLoading || customGameChoicesQuery.isLoading,
    error: customGameQuery.error || customGameChoicesQuery.error,
  };
};

/**
 * React hook to get the time before the next Tunele.
 *
 * @param targetDate the date to compute the time before
 * @returns the time before the next Tunele
 */
export const useCountdown = (targetDate: number) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    targetDate - new Date().getTime()
  );

  useEffect(() => {
    let animationFrameId: number;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      setTimeLeft(distance);

      if (distance < 0) cancelAnimationFrame(animationFrameId);
      else animationFrameId = requestAnimationFrame(updateCountdown);
    };

    animationFrameId = requestAnimationFrame(updateCountdown);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetDate]);

  return timeLeft;
};
