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
		<div className="w-full flex flex-col items-center justify-center">
			<input
				className="lg:w-1/3 md:w-1/2 w-4/5 p-2 bg-[#131213] border-2 border-gray-800 text-white rounded-none focus:outline-none"
				type="text"
				value={inputValue}
				onChange={handleInputChange}
			/>
			<div className="lg:w-1/3 md:w-1/2 w-4/5 pt-4 flex justify-between">
				<button
					className="w-1/3 md:w-28 p-4 rounded-full text-center text-white py-2 bg-gray-800 hover:bg-gray-500 focus:outline-none"
					onClick={handleSkip}
				>
					Skip
				</button>
				<button
					className="w-1/3 md:w-28 p-4 rounded-full text-center text-black py-2 bg-[#1fd660] hover:bg-[#18b853] focus:outline-none"
					disabled={isButtonDisabled}
					onClick={handleAddGuess}
				>
					Submit
				</button>
			</div>
		</div>
	);
};

export default SearchBar;
