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
		<div className="flex flex-col items-center mt-24">
			<div className="w-1/2 text-black">
				{userGuesses.map((item, index) => (
					<div className="w-full margin-5 px-4 py-2 m-2 bg-white rounded-lg border-b border-gray-200 dark:border-gray-600">
						{item.answer}
					</div>
				))}
				{emptyGuesses.map((item, index) => (
					<div className="w-full margin-5 px-4 py-2 m-2 bg-white rounded-lg border-b border-gray-200 dark:border-gray-600"></div>
				))}
			</div>
		</div>
	);
};

export default ListGroup;
