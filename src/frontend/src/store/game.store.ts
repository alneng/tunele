import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { GameResult, SavedGameData, TrackGuess, GameTrack, Track, AxiosApiError } from "@/types";
import {
  fetchMainGame,
  fetchMainGameChoices,
  fetchCustomGame,
  fetchCustomGameChoices,
  postMainGameStats,
  postCustomGameStats,
} from "@/api/game";
import { mergeGameData, migrateFromOldStorage } from "@/utils/data.utils";

export interface GameState {
  // Saved game data
  savedData: SavedGameData;

  // Main game state
  mainGame: {
    isLoading: boolean;
    error: AxiosApiError | null;
    currentTrack: GameTrack | null;
    tracklist: Track[];
    userGuesses: TrackGuess[];
    isGameFinished: boolean;
  };

  // Custom game state
  customGame: {
    isLoading: boolean;
    error: AxiosApiError | null;
    currentTrack: GameTrack | null;
    tracklist: Track[];
    userGuesses: TrackGuess[];
    isGameFinished: boolean;
    validPlaylist: boolean;
    playlistId: string | null;
  };

  // Game actions
  /**
   * Load main game data from the API.
   */
  loadMainGame: () => Promise<void>;
  /**
   * Load custom game data from the API.
   *
   * @param playlistId the ID of the playlist to load
   * @param reload reload flag to force reload the game
   */
  loadCustomGame: (playlistId: string, reload?: boolean) => Promise<void>;
  /**
   * Update main game guesses and handle game completion.
   *
   * @param newGuesses the new guesses
   */
  updateMainGameGuesses: (newGuesses: TrackGuess[]) => void;
  /**
   * Update custom game guesses and handle game completion.
   *
   * @param newGuesses the new guesses
   */
  updateCustomGameGuesses: (newGuesses: TrackGuess[]) => void;

  /**
   * Merges remote data into the saved data.
   *
   * @param remoteData the remote data to merge with
   * @returns the merged saved data
   */
  mergeWithRemoteData: (remoteData: SavedGameData) => SavedGameData;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initialize saved data structure
        savedData: { main: [], custom: {} },

        // Initialize main game state
        mainGame: {
          isLoading: false,
          error: null,
          currentTrack: null,
          tracklist: [],
          userGuesses: [],
          isGameFinished: false,
        },

        // Initialize custom game state
        customGame: {
          isLoading: false,
          error: null,
          currentTrack: null,
          tracklist: [],
          userGuesses: [],
          isGameFinished: false,
          validPlaylist: false,
          playlistId: null,
        },

        loadMainGame: async () => {
          set(
            (state) => ({
              mainGame: {
                ...state.mainGame,
                isLoading: true,
                error: null,
              },
            }),
            undefined,
            "loadMainGame/loading",
          );

          try {
            const trackData = await fetchMainGame();

            // Get existing game data and check if this game has been started/completed
            const { savedData } = get();
            const existingGameData = savedData.main.find((game) => game.id === trackData.id);

            const choicesData = await fetchMainGameChoices();

            // Update state with fetched data
            set(
              (state) => ({
                mainGame: {
                  ...state.mainGame,
                  isLoading: false,
                  currentTrack: trackData,
                  tracklist: choicesData.tracklist,
                  userGuesses: existingGameData?.guessList || [],
                  isGameFinished: existingGameData?.hasFinished || false,
                },
              }),
              undefined,
              "loadMainGame/success",
            );
          } catch (error) {
            set(
              (state) => ({
                mainGame: {
                  ...state.mainGame,
                  isLoading: false,
                  error: error as AxiosApiError,
                },
              }),
              undefined,
              "loadMainGame/error",
            );
          }
        },

        // Load custom game data from the API
        loadCustomGame: async (playlistId, reload = false) => {
          if (!playlistId) {
            set(
              (state) => ({
                customGame: {
                  ...state.customGame,
                  validPlaylist: false,
                  playlistId: null,
                  isLoading: false,
                },
              }),
              undefined,
              "loadCustomGame/invalidPlaylist",
            );
            return;
          }

          set(
            (state) => ({
              customGame: {
                ...state.customGame,
                isLoading: true,
                error: null,
                playlistId,
              },
            }),
            undefined,
            "loadCustomGame/loading",
          );

          try {
            // Fetch the custom game track
            const trackData = await fetchCustomGame({
              playlist: playlistId,
              r: reload,
            });

            if (!trackData) {
              set(
                (state) => ({
                  customGame: {
                    ...state.customGame,
                    isLoading: false,
                    validPlaylist: false,
                  },
                }),
                undefined,
                "loadCustomGame/invalidTrack",
              );
              return;
            }

            // Get existing game data and check if this game has been started/completed
            const { savedData } = get();
            const playlistData = savedData.custom[playlistId] || [];
            const existingGameData = playlistData.find((game) => game.id === trackData.id);

            // Fetch the custom game choices
            const choicesData = await fetchCustomGameChoices(playlistId);

            // Update state with fetched data
            set(
              (state) => ({
                customGame: {
                  ...state.customGame,
                  isLoading: false,
                  validPlaylist: true,
                  currentTrack: trackData,
                  tracklist: choicesData?.tracklist || [],
                  userGuesses: existingGameData?.guessList || [],
                  isGameFinished: existingGameData?.hasFinished || false,
                },
              }),
              undefined,
              "loadCustomGame/success",
            );
          } catch (error) {
            set(
              (state) => ({
                customGame: {
                  ...state.customGame,
                  isLoading: false,
                  error: error as AxiosApiError,
                },
              }),
              undefined,
              "loadCustomGame/error",
            );
          }
        },

        updateMainGameGuesses: (newGuesses: TrackGuess[]) => {
          const state = get();
          const { currentTrack } = state.mainGame;

          if (!currentTrack) return;

          // Check if game is finished with this update
          const isLastGuessCorrect =
            newGuesses.length > 0 && newGuesses[newGuesses.length - 1].isCorrect;
          const isGameFinished = isLastGuessCorrect || newGuesses.length >= 6;
          const score = isLastGuessCorrect ? newGuesses.length : 0;

          // Update game state
          set(
            (state) => ({
              mainGame: {
                ...state.mainGame,
                userGuesses: newGuesses,
                isGameFinished,
              },
            }),
            undefined,
            "updateMainGameGuesses/gameState",
          );

          // Create today's game result object
          const todaysDataObject: GameResult = {
            hasFinished: isGameFinished,
            hasStarted: true,
            id: currentTrack.id,
            score,
            guessList: newGuesses,
          };

          // Update saved data
          set(
            (state) => {
              const savedData = { ...state.savedData };
              const playlistData = [...savedData.main];

              // Replace or add the game result
              const existingIndex = playlistData.findIndex((game) => game.id === currentTrack.id);
              if (existingIndex >= 0) {
                playlistData[existingIndex] = todaysDataObject;
              } else {
                playlistData.push(todaysDataObject);
              }

              savedData.main = playlistData;

              // If game is finished, post stats to the API
              if (isGameFinished) {
                postMainGameStats(score).catch(console.error);
              }

              return { savedData };
            },
            undefined,
            "updateMainGameGuesses/persisted",
          );
        },

        updateCustomGameGuesses: (newGuesses: TrackGuess[]) => {
          const state = get();
          const { currentTrack, playlistId } = state.customGame;

          if (!currentTrack || !playlistId) return;

          // Check if game is finished with this update
          const isLastGuessCorrect =
            newGuesses.length > 0 && newGuesses[newGuesses.length - 1].isCorrect;
          const isGameFinished = isLastGuessCorrect || newGuesses.length >= 6;
          const score = isLastGuessCorrect ? newGuesses.length : 0;

          // Update game state
          set(
            (state) => ({
              customGame: {
                ...state.customGame,
                userGuesses: newGuesses,
                isGameFinished,
              },
            }),
            undefined,
            "updateCustomGameGuesses/gameState",
          );

          // Create today's game result object
          const todaysDataObject: GameResult = {
            hasFinished: isGameFinished,
            hasStarted: true,
            id: currentTrack.id,
            score,
            guessList: newGuesses,
          };

          // Update saved data
          set(
            (state) => {
              const savedData = { ...state.savedData };
              const customData = { ...savedData.custom };

              if (!customData[playlistId]) {
                customData[playlistId] = [todaysDataObject];
              } else {
                const playlistData = [...customData[playlistId]];

                // Replace or add the game result
                const existingIndex = playlistData.findIndex((game) => game.id === currentTrack.id);
                if (existingIndex >= 0) {
                  playlistData[existingIndex] = todaysDataObject;
                } else {
                  playlistData.push(todaysDataObject);
                }

                customData[playlistId] = playlistData;
              }

              savedData.custom = customData;

              // If game is finished, post stats to the API
              if (isGameFinished) {
                postCustomGameStats(playlistId, score).catch(console.error);
              }

              return { savedData };
            },
            undefined,
            "updateCustomGameGuesses/persisted",
          );
        },

        mergeWithRemoteData: (remoteData: SavedGameData) => {
          const currentData = get().savedData;
          const mergedData = mergeGameData(currentData, remoteData);

          set({ savedData: mergedData }, undefined, "mergeWithRemoteData");

          return mergedData;
        },
      }),
      {
        name: "tunele-game-store",
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => {
          // Only persist the savedData part of the state
          const { savedData } = state;
          return { ...savedData };
        },
        merge: (persistedState, currentState) => {
          // Load existing data from local storage
          const existingData = persistedState as SavedGameData;
          const state = existingData
            ? {
                ...currentState,
                savedData: mergeGameData(existingData, currentState.savedData),
              }
            : currentState;
          // Migrate from old storage format if necessary
          const migration = migrateFromOldStorage(state);
          return {
            ...state,
            savedData: migration,
          };
        },
      },
    ),
    { name: "tunele-game-store", enabled: import.meta.env.DEV },
  ),
);
