import React from "react";
import { TrackGuess } from "@/types";
import clsx from "clsx";

interface ListGroupProps {
  userGuesses: TrackGuess[];
}

const ListGroup: React.FC<ListGroupProps> = ({ userGuesses }) => {
  const guessSlots = Array(6)
    .fill(null)
    .map((_, index) => {
      return index < userGuesses.length ? userGuesses[index] : null;
    });

  return (
    <div className="w-full flex flex-col items-center">
      {guessSlots.map((guess, index) => (
        <div
          key={index}
          className={clsx("md:w-612px w-4/5 px-4 py-1.5 m-1 bg-gray-800", {
            "h-10": !guess,
            "text-green border-2 border-green": guess?.isCorrect,
            "text-white border-2 border-white": guess?.isSkipped,
            "text-yellow border-2 border-yellow":
              guess?.isArtist && !guess?.isCorrect && !guess?.isSkipped,
            "text-red border-2 border-red":
              guess && !guess.isCorrect && !guess.isSkipped && !guess.isArtist,
          })}
        >
          <p>
            {guess &&
              (guess.isSkipped ? "Skipped" : guess.answer.formattedString)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ListGroup;
