import React, { useState, useEffect } from "react";
import trackGuessFormat from "../interfaces/TrackGuessFormat";

import "./Countdown.css";

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
    const [usedAttempts, setUsedAttempts] = useState<number>(1);
    const [numberSeconds, setNumberSeconds] = useState<number>(1);
    const [isShareClicked, setIsShareClicked] = useState(false);
    const [countdownTime, setCountdownTime] = useState<number>(0);

    useEffect(() => {
        if (userGuesses.length === 6 && !userGuesses[5].isCorrect)
            setUsedAttempts(0);
        else setUsedAttempts(userGuesses.length);
    }, [userGuesses]);

    useEffect(() => {
        const songLimits: number[] = [1, 2, 4, 7, 11, 16];
        setNumberSeconds(songLimits[usedAttempts - 1]);
    }, [usedAttempts]);

    const handleShare = () => {
        setIsShareClicked(true);
        setTimeout(() => {
            setIsShareClicked(false);
        }, 1000);

        const emojis = {
            isCorrect: "🟩",
            isArtist: "🟨",
            isSkipped: "⬜",
            default: "🟥",
        };
        const guessListSummary: string[] = userGuesses.map((guess) => {
            if (guess?.isCorrect) return emojis.isCorrect;
            if (guess?.isArtist) return emojis.isArtist;
            if (guess?.isSkipped) return emojis.isSkipped;
            return emojis.default;
        });
        while (guessListSummary.length < 6) {
            guessListSummary.push("⬛");
        }

        let shareString = `Tunele #${id}\n${guessListSummary.join("")}\n${
            self.location.href.split("&")[0]
        }`;
        if (self.location.search.includes("playlist"))
            shareString = `Custom ${shareString}`;
        navigator.clipboard.writeText(shareString);
    };

    useEffect(() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const timeUntilMidnight = midnight.getTime() - now.getTime();

        setCountdownTime(timeUntilMidnight);

        const interval = setInterval(() => {
            setCountdownTime((prevTime) => {
                const updatedTime = prevTime - 1000;
                if (updatedTime < 0) {
                    clearInterval(interval);
                    window.location.reload();
                    return 0;
                }
                return updatedTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatCountdown = (time: number) => {
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);

        const formattedHours = hours < 10 ? `0${hours}` : hours;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

        return `${formattedHours} : ${formattedMinutes} : ${formattedSeconds}`;
    };

    return (
        <>
            <div className="bg-[#131213] flex flex-col h-screen justify-center items-center text-white">
                <a href={externalUrl} target="_blank">
                    <img
                        src={albumCover}
                        alt="Album Cover"
                        className="max-w-[300px]"
                    />
                </a>

                <div>
                    <div className="text-center mt-6 text-2xl font-semibold">
                        <a href={externalUrl} target="_blank">
                            {song}
                        </a>
                    </div>
                    <div className="text-center text-base font-regular text-gray-300">
                        {artists.join(", ")}
                    </div>
                </div>

                <div>
                    <div className="text-center mt-10 text-xl font-semibold">
                        {usedAttempts !== 0 && <p>Great Performance!</p>}
                        {usedAttempts === 0 && <p>Almost!</p>}
                    </div>
                    <div className="text-center text-base font-regular text-gray-300 max-w-[80vw]">
                        {usedAttempts !== 0 && (
                            <p>
                                You got today's Tunele in {numberSeconds} second
                                {numberSeconds > 1 && <span>s</span>}
                            </p>
                        )}
                        {usedAttempts === 0 && (
                            <p>
                                Try again tomorrow for another chance to get the
                                daily Tunele!
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleShare}
                    className={`mt-5 px-6 py-3 rounded-full ${
                        isShareClicked
                            ? "bg-white"
                            : "bg-[#1fd660] hover:bg-[#18b853]"
                    } active:bg-white focus:outline-none transition-colors duration-300 text-black`}
                >
                    Share
                </button>
            </div>
            <div className="text-gray-300 text-center fixed left-0 right-0 bottom-8 flex flex-col items-center countdown">
                <p>Come back for tomorrow's Tunele in:</p>
                <p className="text-xl font-semibold">
                    {formatCountdown(countdownTime)}
                </p>
            </div>
        </>
    );
};

export default GameConclusion;
