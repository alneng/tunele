import React, { useState, useEffect } from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface ListGroupProps {
	userGuesses: trackGuessFormat[];
}

const ListGroup: React.FC<ListGroupProps> = ({ userGuesses }) => {
	const [emptyGuesses, setEmptyGuesses] = useState<string[]>(
		Array(8).fill("")
	);

	useEffect(() => {
		setEmptyGuesses((prevGuesses) => prevGuesses.slice(1));
	}, [userGuesses]);

	return (
		<div className="w-full flex flex-col items-center">
			{userGuesses.map((item, index) => (
				<div
					key={index}
					className={`lg:w-1/3 md:w-1/2 w-4/5 px-4 py-1.5 m-1 bg-gray-800 ${
						item.isCorrect
							? "text-green border-2 border-green"
							: item.isSkipped
							? "text-white border-2 border-white"
							: item.isArtist
							? "text-yellow border-2 border-yellow"
							: "text-red border-2 border-red"
					}`}
				>
					{item.isSkipped && <p>Skipped</p>}
					{!item.isSkipped && <p>{item.answer.formattedString}</p>}
				</div>
			))}
			{emptyGuesses.map((_, index) => (
				<div
					key={index}
					className="lg:w-1/3 md:w-1/2 w-4/5 h-10 px-4 m-1 text-black bg-gray-800"
				/>
			))}
		</div>
	);
};

export default ListGroup;
