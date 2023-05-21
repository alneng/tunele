import FormattedPossibleAnswer from "./FormattedPossibleAnswer";

interface trackGuessFormat {
	answer: FormattedPossibleAnswer;
	isCorrect: boolean;
	isSkipped: boolean;
	isArtist: boolean;
}

export default trackGuessFormat;
