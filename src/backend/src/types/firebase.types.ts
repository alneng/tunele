import { TrackMetadata } from "./track.types";
import { SavedGameData } from "./game.types";

export type FirebaseTrack = {
  artists: string[];
  playedBefore: boolean;
  song: string;
  spotifyUri: string;
} & TrackMetadata;

export type FirebaseGameTrack = {
  artists: string[];
  createdAt?: string;
  date: string;
  id: number;
  song: string;
  stats: {
    [index: number]: number;
  };
  totalPlays: number;
} & TrackMetadata;

export type FirebaseMainPlaylist = {
  createdAt: string;
  snapshotId: string;
  tracklist: FirebaseTrack[];
  resetHistory: PlaylistResetStatus[]; // Stored in descending order (most recent first)
};

export type FirebaseCustomPlaylist = {
  updatedAt: string;
  gameTracks: FirebaseGameTrack[];
  spotifySnapshotId: string;
} & FirebaseMainPlaylist;

export type MainGameSnapshot = { id: string; data: FirebaseMainPlaylist };

export type PlaylistResetStatus = {
  resetAt: string; // In the format yyyy-MM-dd
  spotifySnapshotId?: string; // The Spotify snapshot ID of the playlist at the time of reset
};

export type FirebaseUser = {
  email: string;
  data: SavedGameData;
  googleSub: string;
  lastLoginAt: string;
};
