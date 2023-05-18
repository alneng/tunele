import React from "react";

import ListGroup from "./ListGroup";
import AudioPlayer from "./AudioPlayer";
import SearchBar from "./SearchBar";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

interface GameProps {
	song: string;
	artists: string[];
	trackPreview: string;
	albumCover: string;
	userGuesses: trackGuessFormat[];
	setUserGuesses: (newGuesses: trackGuessFormat[]) => void;
}

const Game: React.FC<GameProps> = ({
	song,
	artists,
	trackPreview,
	userGuesses,
	setUserGuesses,
}) => {
	return (
		<div className="bg-[#131213] flex flex-col justify-center h-screen text-white">
			<ListGroup userGuesses={userGuesses} />
			<AudioPlayer audioSrc={trackPreview} userGuesses={userGuesses} />
			<SearchBar
				userGuesses={userGuesses}
				onUpdateGuesses={setUserGuesses}
				song={song}
				artists={artists}
			/>
		</div>
	);
};

export default Game;
