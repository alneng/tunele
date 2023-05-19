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
		<div className="w-full flex flex-col items-center mt-24">
			{userGuesses.map((item, index) => (
				<div
					key={index}
					className="w-1/2 h-10 px-4 py-2 m-1 text-black bg-white rounded-lg"
				>
					{item.answer}
				</div>
			))}
			{emptyGuesses.map((_, index) => (
				<div
					key={index}
					className="w-1/2 h-10 px-4 py-2 m-1 text-black bg-white rounded-lg"
				/>
			))}
		</div>
	);
};

export default ListGroup;
