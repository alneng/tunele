import React from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface ListGroupProps {
	userGuesses: trackGuessFormat[];
}

const ListGroup: React.FC<ListGroupProps> = ({ userGuesses }) => {
	return (
		<div>
			{userGuesses.map((item, index) => (
				<div key={index}>
					<span>{item.answer}</span>
				</div>
			))}
		</div>
	);
};

export default ListGroup;
