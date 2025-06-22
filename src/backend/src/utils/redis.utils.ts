export const CacheKeys = {
  SPOTIFY_ACCESS_TOKEN: "cache:spotify_access_token",
  PLAYLIST_GAME_TRACK: (playlistId: string, date: string) =>
    `cache:spotify_playlist:${playlistId}:game_track:${date}`,
  PLAYLIST_TRACKS: (playlistId: string, snapshotId: string) =>
    `cache:spotify_playlist:${playlistId}:tracks:${snapshotId}`,
};
