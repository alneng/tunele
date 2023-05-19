import React, { useState } from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

interface SearchBarProps {
	userGuesses: trackGuessFormat[];
	onUpdateGuesses: (newGuesses: trackGuessFormat[]) => void;
	song: string;
	artists: string[];
	allSongs: trackFormat[];
}

const SearchBar: React.FC<SearchBarProps> = ({
	userGuesses,
	onUpdateGuesses,
	song,
	artists,
	allSongs,
}) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [possibleAnswers, setPossibleAnswers] = useState<string[]>([]);
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setInputValue(event.target.value);
		setPossibleAnswers([]);
		setIsButtonDisabled(true);

		if (event.target.value.length >= 3) {
			const matchingAnswers: string[] = [];
			const inputValueLowercase = event.target.value.toLowerCase();
			const addedToAnswersMap: { [key: string]: boolean } = {};

			for (const element of allSongs) {
				const answerString = `${element.song} - ${element.artists.join(
					", "
				)}`;
				for (const artist of element.artists) {
					if (
						(artist.toLowerCase().includes(inputValueLowercase) ||
							element.song
								.toLowerCase()
								.includes(inputValueLowercase)) &&
						!addedToAnswersMap[answerString]
					) {
						addedToAnswersMap[answerString] = true;
						matchingAnswers.push(answerString);
					}
				}
			}

			setPossibleAnswers(matchingAnswers);
		}
	};

	// const handleListClick = (index: number) => {
	// 	setInputValue(possibleAnswers[index]);
	// 	setIsButtonDisabled(false);
	// };

	const handleAddGuess = () => {
		// logic to check if the answer is right

		// answer: "Title - Artists"
		const guess = {
			answer: "",
			isCorrect: false,
			isSkipped: false,
			isArtist: false,
		};
		const newGuesses = [...userGuesses, guess];
		onUpdateGuesses(newGuesses);
		setInputValue("");
	};

	const handleSkip = () => {
		const guess = {
			answer: "",
			isCorrect: false,
			isSkipped: true,
			isArtist: false,
		};
		const newGuesses = [...userGuesses, guess];
		onUpdateGuesses(newGuesses);
		setInputValue("");
	};

	return (
		<div className="my-4">
			<div className="text-black">
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>

			<button onClick={handleSkip}>Skip</button>
			<button disabled={isButtonDisabled} onClick={handleAddGuess}>
				Submit
			</button>
		</div>
	);
};

export default SearchBar;
