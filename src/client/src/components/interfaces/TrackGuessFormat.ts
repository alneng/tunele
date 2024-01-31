import FormattedPossibleAnswer from "./FormattedPossibleAnswer";

export default interface TrackGuessFormat {
  answer: FormattedPossibleAnswer;
  isCorrect: boolean;
  isSkipped: boolean;
  isArtist: boolean;
}
