import React, { useState, useEffect } from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface ListGroupProps {
	userGuesses: trackGuessFormat[];
}

const ListGroup: React.FC<ListGroupProps> = ({ userGuesses }) => {
	const [emptyGuesses, setEmptyGuesses] = useState<string[]>([
		"",
		"",
		"",
		"",
		"",
		"",
		"",
	]);

	useEffect(() => {
		const newArray: string[] = [...emptyGuesses];
		newArray.shift();
		setEmptyGuesses(newArray);
	}, [userGuesses]);

	return (
		<div className="w-full flex flex-col items-center mt-24">
			{userGuesses.map((item, index) => (
				<div className="w-1/2 h-10 px-4 py-2 m-1 text-black bg-white rounded-lg">
					{item.answer}
				</div>
			))}
			{emptyGuesses.map((item, index) => (
				<div className="w-1/2 h-10 px-4 py-2 m-1 text-black bg-white rounded-lg"></div>
			))}
		</div>
	);
};

export default ListGroup;
