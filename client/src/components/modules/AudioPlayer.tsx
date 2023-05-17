import React from "react";

interface AudioPlayerProps {
	audioSrc: string;
	userGuesses: {
		answer: string;
		isCorrect: boolean;
		isSkipped: boolean;
		isArtist: boolean;
	}[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, userGuesses }) => {
	const handlePlayback = () => {
		// handle playback logic
	};

	return (
		<div>
			<audio src={audioSrc}></audio>
			<button onClick={handlePlayback}></button>
		</div>
	);
};

export default AudioPlayer;
