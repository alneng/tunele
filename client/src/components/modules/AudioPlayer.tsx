import React, { useEffect, useRef, useState } from "react";

import FormattedPossibleAnswer from "../interfaces/FormattedPossibleAnswer";

interface AudioPlayerProps {
    audioSrc: string;
    userGuesses: {
        answer: FormattedPossibleAnswer;
        isCorrect: boolean;
        isSkipped: boolean;
        isArtist: boolean;
    }[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, userGuesses }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [currentLevel, setCurrentLevel] = useState<number>(0);

    const songLimits: number[] = [1000, 2000, 4000, 7000, 11000, 16000];

    useEffect(() => {
        setCurrentLevel(userGuesses.length);
    }, [userGuesses]);

    const handlePlayback = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.currentTime = 0;

            const timeoutDuration = songLimits[currentLevel];

            setTimeout(() => {
                audioRef.current?.pause();
            }, timeoutDuration + 100);

            audioRef.current.volume = 0.3;
            audioRef.current.play();
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
            <div className="relative md:w-612px w-4/5 h-6 bg-gray-800">
                {songLimits.map((interval, index) => (
                    <div
                        key={index}
                        className="absolute h-full bg-gray-300"
                        style={{
                            left: `${(interval / 16000) * 100}%`,
                            width: "2px",
                        }}
                    ></div>
                ))}
                <div
                    className="h-full bg-[#1fd660]"
                    style={{
                        width: `${progress}%`,
                        transition: "width 0.3s ease-in-out",
                    }}
                ></div>
            </div>
            <button
                onClick={handlePlayback}
                className="text-white my-4"
                title="Play"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="56"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-play-circle"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
            </button>
        </div>
    );
};

export default AudioPlayer;
