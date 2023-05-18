import React from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface ListGroupProps {
	userGuesses: trackGuessFormat[];
}

const ListGroup: React.FC<ListGroupProps> = ({ userGuesses }) => {
	return (
		<ul className="text-center w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-black">
    <li className="w-full px-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600">Answer 1</li>
    <li className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">Answer 2</li>
    <li className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">Answer 3</li>
    <li className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600">Answer 4</li>
    <li className="w-full px-4 py-2 rounded-b-lg">Answer 5</li>
    </ul>

	);
};

export default ListGroup;
