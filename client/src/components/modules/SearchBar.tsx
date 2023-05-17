import React, { useState } from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface SearchBarProps {
	userGuesses: trackGuessFormat[];
	onUpdateGuesses: (newGuesses: trackGuessFormat[]) => void;
	song: string;
	artists: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
	userGuesses,
	onUpdateGuesses,
	song,
	artists,
}) => {
	const [inputValue, setInputValue] = useState<string>("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const handleAddGuess = () => {
		// logic to check if the answer is right

		// answer: "Title - Artists"
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
		<div>
			<input
				type="text"
				value={inputValue}
				onChange={handleInputChange}
			/>
			<button onClick={handleSkip}>Skip</button>
			<button onClick={handleAddGuess}>Submit</button>
		</div>
	);
};

export default SearchBar;
