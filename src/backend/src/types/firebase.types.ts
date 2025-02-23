import { TrackMetadata } from ".";

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
};

export type FirebaseCustomPlaylist = {
  updatedAt: string;
  gameTracks: FirebaseGameTrack[];
} & FirebaseMainPlaylist;
