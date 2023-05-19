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
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setPossibleAnswers([]);
		setIsButtonDisabled(true)
        allSongs.forEach((element: trackFormat) => {
            const answerString = `${element.song} - ${element.artists.join(
                ", "
            )}`;
            if (element.song.includes(event.target.value))
                setPossibleAnswers([...possibleAnswers, answerString]);
            element.artists.forEach((element: string) => {
                if (element.includes(event.target.value))
                    setPossibleAnswers([...possibleAnswers, answerString]);
            });
        });
    };

	// const handleListClick = (index: number) => {
	// 	const userGuessed = possibleAnswers[index]
	// }
	
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
                {/* <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                /> */}

				{/* LIST DROP DOWN OF SONGS  */}
			<div id="dropdownSearch" class="z-10 hidden bg-white rounded-lg shadow w-60 dark:bg-gray-700">
				<div class="p-3">
				<label for="input-group-search" class="sr-only">Search</label>
				<div class="relative">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<svg class="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
					</div>
					<input type="text" value={inputValue} onChange={handleInputChange} id="input-group-search" class="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search user">
				</div>
				</div>
				<ul class="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownSearchButton">
				<li>
					<div class="flex items-center pl-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
					<input id="checkbox-item-11" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
					<label for="checkbox-item-11" class="w-full py-2 ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">Bonnie Green</label>
					</div>
				</li>
				</ul>
				</div>
				{/* LIST DROP DOWN OF SONGS */}

            </div>
            <button onClick={handleSkip}>Skip</button>
            <button disabled={isButtonDisabled} onClick={handleAddGuess}>Submit</button>
        </div>
    );
};

export default SearchBar;
