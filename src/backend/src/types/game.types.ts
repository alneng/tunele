import { FormattedTrack, Track, TrackMetadata } from ".";

/**
 * Data for the daily game's track. Includes the track,
 * game id, preview, cover, and external url.
 */
export type GameTrack = {
  id: number;
} & Track &
  TrackMetadata;

export type TrackGuess = {
  answer: FormattedTrack;
  isCorrect: boolean;
  isSkipped: boolean;
  isArtist: boolean;
};

export type GameResult = {
  guessList: TrackGuess[];
  hasFinished: boolean;
  hasStarted: boolean;
  id: number;
  score: number;
};

export type SavedGameData = {
  main: GameResult[];
  custom: { [playlistId: string]: GameResult[] };
};
