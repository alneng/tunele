import React, { useEffect, useRef, useState } from "react";

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
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [currentLevel, setCurrentLevel] = useState<number>(0);

	useEffect(() => {
		setCurrentLevel(userGuesses.length);
	}, [userGuesses]);

	const handlePlayback = () => {
		if (audioRef.current && audioRef.current.paused) {
			audioRef.current.currentTime = 0;
			audioRef.current.play();
			const songLimits: number[] = [1000, 2000, 4000, 7000, 11000, 16000];

			const timeoutDuration = songLimits[currentLevel];

			setTimeout(() => {
				audioRef.current?.pause();
			}, timeoutDuration);
		}
	};

	const handleProgress = () => {
		if (audioRef.current) {
			const { currentTime } = audioRef.current;
			const progressPercentage = (currentTime / 16) * 100;
			setProgress(progressPercentage);
		}
	};

	return (
		<div className="w-full flex flex-col items-center mt-16">
			<audio
				src={audioSrc}
				ref={audioRef}
				onTimeUpdate={handleProgress}
				onLoadedData={handleProgress}
			></audio>
			<div className="md:w-1/2 w-4/5 h-6 bg-gray-200 my-4">
				<div
					className="h-full bg-blue-500"
					style={{
						width: `${progress}%`,
						transition: "width 0.3s ease-in-out",
					}}
				></div>
			</div>
			<button
				onClick={handlePlayback}
				className="my-2 bg-blue-500 text-white px-4 py-2 rounded"
			>
				Play
			</button>
		</div>
	);
};

export default AudioPlayer;
