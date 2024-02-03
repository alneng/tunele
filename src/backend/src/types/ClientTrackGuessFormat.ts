import FormattedPossibleAnswer from "./ClientFormattedPossibleAnswer";

export default interface TrackGuessFormat {
  answer: FormattedPossibleAnswer;
  isCorrect: boolean;
  isSkipped: boolean;
  isArtist: boolean;
}
