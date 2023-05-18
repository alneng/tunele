import React from "react";

import ListGroup from "./ListGroup";
import AudioPlayer from "./AudioPlayer";
import SearchBar from "./SearchBar";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

interface GameProps {
	song: string;
	artists: string[];
	trackPreview: string;
	userGuesses: trackGuessFormat[];
	setUserGuesses: (newGuesses: trackGuessFormat[]) => void;
	allSongs: trackFormat[];
}

const Game: React.FC<GameProps> = ({
	song,
	artists,
	trackPreview,
	userGuesses,
	setUserGuesses,
	allSongs,
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
				allSongs={allSongs}
			/>
		</div>
	);
};

export default Game;
