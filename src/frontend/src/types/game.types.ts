import { FormattedTrack, Track, TrackMetadata } from ".";

/**
 * The track choices for the daily game.
 */
export type GameChoices = {
  tracklist: Track[];
};

/**
 * Data for the daily game's track. Includes the track,
 * game id, preview, cover, and external url.
 */
export type GameTrack = {
  id: number;
} & Track &
  TrackMetadata;

/**
 * Data for the daily game. Includes the game track and guess options.
 */
export type GameData = GameTrack & GameChoices;

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
