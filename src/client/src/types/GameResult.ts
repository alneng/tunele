import TrackGuessFormat from "./TrackGuessFormat";

export default interface GameResult {
  guessList: TrackGuessFormat[];
  hasFinished: boolean;
  hasStarted: boolean;
  id: number;
  score: number;
}
