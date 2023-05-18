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
		<div className="my-4">
			<div className="text-black">
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>
			<button onClick={handleSkip}>Skip</button>
			<button onClick={handleAddGuess}>Submit</button>
		</div>
	);
};

export default SearchBar;
