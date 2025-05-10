import React, { useMemo, useRef, useState } from "react";
import { TrackGuess } from "@/types";
import { CirclePauseIcon, CirclePlayIcon } from "lucide-react";

interface AudioPlayerProps {
  audioSrc: string;
  userGuesses: TrackGuess[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, userGuesses }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const currentLevel = useMemo(() => userGuesses.length, [userGuesses]);
  const [audioPlayerTimeout, setAudioPlayerTimeout] =
    useState<NodeJS.Timeout>();

  const songLimits: number[] = [1000, 2000, 4000, 7000, 11000, 16000];

  const handlePlayback = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const timeoutDuration = songLimits[currentLevel];

      audioRef.current.volume = 0.3;
      audioRef.current.play();

      const timeout = setTimeout(() => {
        audioRef.current?.pause();
      }, timeoutDuration + 100);
      setAudioPlayerTimeout(timeout);
    }
  };

  const handlePause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      clearTimeout(audioPlayerTimeout);
      audioRef.current.pause();
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) handlePlayback();
      else handlePause();
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
      />

      <div className="relative md:w-612px w-4/5 h-6 bg-gray-800">
        {songLimits.map((interval, index) => (
          <div
            key={index}
            className="absolute h-full bg-gray-300"
            style={{
              left: `${(interval / 16000) * 100}%`,
              width: "2px",
            }}
          />
        ))}
        <div
          className="h-full bg-[#1fd660]"
          style={{
            width: `${progress}%`,
            transition: "width 0.3s linear",
          }}
        />
      </div>

      <button onClick={togglePlayback} className="text-white my-4">
        {!audioRef || audioRef.current?.paused ? (
          <CirclePlayIcon size={56} strokeWidth={1} />
        ) : (
          <CirclePauseIcon size={56} strokeWidth={1} />
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;
