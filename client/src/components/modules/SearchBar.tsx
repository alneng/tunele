import React, { useState } from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";
import FormattedPossibleAnswer from "../interfaces/FormattedPossibleAnswer";

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
	const [inputValue, setInputValue] = useState<FormattedPossibleAnswer>({
		formattedString: "",
		song: "",
		artists: [],
	});
	const [possibleAnswers, setPossibleAnswers] = useState<
		FormattedPossibleAnswer[]
	>([]);
	const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setInputValue({
			formattedString: event.target.value,
			song: "",
			artists: [],
		});
		setPossibleAnswers([]);
		setIsButtonDisabled(true);

		if (event.target.value.length >= 2) {
			const matchingAnswers: FormattedPossibleAnswer[] = [];
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
						matchingAnswers.push({
							formattedString: answerString,
							song: element.song,
							artists: element.artists,
						});
					}
				}
			}

			setPossibleAnswers(matchingAnswers);
		}
	};

	const handleListClick = (index: number) => {
		setInputValue({
			formattedString: possibleAnswers[index].formattedString,
			song: possibleAnswers[index].song,
			artists: possibleAnswers[index].artists,
		});
		setPossibleAnswers([]);
		setIsButtonDisabled(false);
	};

	const handleAddGuess = () => {
		setIsButtonDisabled(true);
		const isCorrectArtist = artists.some((correctArtist) =>
			inputValue.artists.includes(correctArtist)
		);

		const guess = {
			answer: inputValue,
			isCorrect:
				inputValue.formattedString ===
				`${song} - ${artists.join(", ")}`,
			isSkipped: false,
			isArtist: isCorrectArtist,
		};

		const newGuesses = [...userGuesses, guess];
		onUpdateGuesses(newGuesses);

		setInputValue({
			formattedString: "",
			song: "",
			artists: [],
		});
	};

	const handleSkip = () => {
		setIsButtonDisabled(true);
		const guess = {
			answer: {
				formattedString: "",
				song: "",
				artists: [],
			},
			isCorrect: false,
			isSkipped: true,
			isArtist: false,
		};
		const newGuesses = [...userGuesses, guess];
		onUpdateGuesses(newGuesses);
		setInputValue({
			formattedString: "",
			song: "",
			artists: [],
		});
	};

	return (
		<div className="relative w-full flex flex-col items-center justify-center">
			<input
				className="lg:w-1/3 md:w-1/2 w-4/5 p-2 bg-[#131213] border-2 border-gray-800 text-white rounded-none focus:outline-none"
				type="text"
				value={inputValue.formattedString}
				onChange={handleInputChange}
			/>
			{possibleAnswers.length > 0 && (
				<div className="absolute bottom-full lg:w-1/3 md:w-1/2 w-4/5 bg-gray-800 text-white overflow-y-scroll max-h-72 border-[#1fd660] border-2 bg-[#131213]">
					{possibleAnswers.map((item, index) => (
						<div
							key={index}
							className="py-2 px-4 cursor-pointer border-b-2 border-gray-500"
							onClick={() => handleListClick(index)}
						>
							{item.formattedString}
						</div>
					))}
				</div>
			)}
			<div className="lg:w-1/3 md:w-1/2 w-4/5 pt-4 flex justify-between">
				<button
					className="w-1/3 md:w-28 p-4 rounded-full text-center text-white py-2 bg-gray-800 hover:bg-gray-500 focus:outline-none"
					onClick={handleSkip}
				>
					Skip
				</button>
				<button
					className={`w-1/3 md:w-28 p-4 rounded-full text-center text-black py-2 focus:outline-none ${
						isButtonDisabled
							? "bg-[#18b853]"
							: "bg-[#1fd660] hover:bg-[#18b853]"
					}`}
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
