export const CacheKeys = {
  SPOTIFY_ACCESS_TOKEN: "cache:spotify_access_token",

  // Main Game
  MAIN_GAME_TRACK: (date: string) => `cache:main:game_track:${date}`,

  // Custom Game
  PLAYLIST_GAME_TRACK: (playlistId: string, date: string) =>
    `cache:spotify_playlist:${playlistId}:game_track:${date}`,
};
