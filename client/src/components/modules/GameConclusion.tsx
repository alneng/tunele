import React from "react";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface GameConclusionProps {
	song: string;
	artists: string[];
	userGuesses: trackGuessFormat[];
	id: number;
	albumCover: string;
	externalUrl: string;
}

const GameConclusion: React.FC<GameConclusionProps> = ({
	song,
	artists,
	userGuesses,
	id,
	albumCover,
	externalUrl,
}) => {
	const handleShare = () => {
		// handle share button logic
	};

	return (
		<div className="">
			<img src={albumCover} alt="" />
			<div>
				{song} - {artists.join(", ")}
			</div>
			<button onClick={handleShare}>Share</button>
		</div>
	);
};

export default GameConclusion;
