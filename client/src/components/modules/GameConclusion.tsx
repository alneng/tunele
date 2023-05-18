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
		<div className="bg-[#131213] flex flex-col h-screen items-center text-white">
			<img src={albumCover} alt="" className="max-w-[300px] mt-24" />
			<div className="text-center mt-4 text-2xl font-semibold">
				{song} - {artists.join(", ")}
			</div>
			<button
				onClick={handleShare}
				className="mt-5 px-6 py-3 rounded-full bg-[#1fd660] text-black hover:bg-[#18b853] focus:outline-none"
			>
				Share
			</button>
		</div>
	);
};

export default GameConclusion;
