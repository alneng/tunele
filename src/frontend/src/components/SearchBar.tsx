import React, { useState } from "react";
import { FormattedTrack, Track, TrackGuess } from "@/types";
import { SearchIcon, XIcon } from "lucide-react";

interface SearchBarProps {
  userGuesses: TrackGuess[];
  onUpdateGuesses: (newGuesses: TrackGuess[]) => void;
  song: string;
  artists: string[];
  allSongs: Track[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  userGuesses,
  onUpdateGuesses,
  song,
  artists,
  allSongs,
}) => {
  const [answer, setAnswer] = useState<FormattedTrack>({
    formattedString: "",
    song: "",
    artists: [],
  });
  const [possibleAnswers, setPossibleAnswers] = useState<FormattedTrack[]>([]);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer({
      formattedString: event.target.value,
      song: "",
      artists: [],
    });
    setPossibleAnswers([]);
    setIsSubmitDisabled(true);

    if (event.target.value.length >= 2) {
      const matchingAnswers: FormattedTrack[] = [];
      const answer = event.target.value.toLowerCase();
      const addedToAnswersMap: { [key: string]: boolean } = {};

      for (const element of allSongs) {
        const answerString = `${element.song} - ${element.artists.join(", ")}`;
        for (const artist of element.artists) {
          if (
            (artist.toLowerCase().includes(answer) ||
              element.song.toLowerCase().includes(answer)) &&
            !addedToAnswersMap[answerString]
          ) {
            addedToAnswersMap[answerString] = true;
            matchingAnswers.push({
              formattedString: answerString,
              song: element.song,
              artists: element.artists,
            });
          }
        }
      }

      setPossibleAnswers(matchingAnswers);
    }
  };

  const handleClearAnswer = () => {
    setAnswer({
      formattedString: "",
      song: "",
      artists: [],
    });
    setPossibleAnswers([]);
    setIsSubmitDisabled(true);
  };

  const handleListClick = (index: number) => {
    setAnswer({
      formattedString: possibleAnswers[index].formattedString,
      song: possibleAnswers[index].song,
      artists: possibleAnswers[index].artists,
    });
    setPossibleAnswers([]);
    setIsSubmitDisabled(false);
  };

  const handleAddGuess = () => {
    setIsSubmitDisabled(true);
    const isCorrectArtist = artists.some((correctArtist) => answer.artists.includes(correctArtist));

    const guess = {
      answer,
      isCorrect: answer.formattedString === `${song} - ${artists.join(", ")}`,
      isSkipped: false,
      isArtist: isCorrectArtist,
    };

    const newGuesses = [...userGuesses, guess];
    onUpdateGuesses(newGuesses);

    setAnswer({
      formattedString: "",
      song: "",
      artists: [],
    });
  };

  const handleSkip = () => {
    setIsSubmitDisabled(true);
    const guess = {
      answer: {
        formattedString: "",
        song: "",
        artists: [],
      },
      isCorrect: false,
      isSkipped: true,
      isArtist: false,
    };
    const newGuesses = [...userGuesses, guess];
    onUpdateGuesses(newGuesses);
    setAnswer({
      formattedString: "",
      song: "",
      artists: [],
    });
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      <div className="relative flex items-center md:w-612px w-4/5">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        {answer.formattedString && (
          <XIcon
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            onClick={handleClearAnswer}
          />
        )}
        <input
          className="w-full p-2 pl-10 bg-[#131213] border-2 border-gray-800 text-white rounded-none focus:outline-none"
          type="text"
          value={answer.formattedString}
          onChange={handleInputChange}
          placeholder="Enter a song title or artist..."
        />
      </div>
      {possibleAnswers.length > 0 && (
        <div className="absolute bottom-full md:w-612px w-4/5 bg-gray-800 text-white overflow-y-scroll max-h-72 border-[#1fd660] border-2 bg-[#131213]">
          {possibleAnswers.map((item, index) => (
            <div
              key={index}
              className="py-2 px-4 cursor-pointer border-b-2 border-gray-500"
              onClick={() => handleListClick(index)}
            >
              {item.formattedString}
            </div>
          ))}
        </div>
      )}
      <div className="md:w-612px w-4/5 pt-4 flex justify-between">
        <button
          className="w-28 p-4 rounded-full text-center text-white py-2 bg-gray-800 hover:bg-gray-500 focus:outline-none"
          onClick={handleSkip}
          title="Skip"
        >
          {userGuesses.length < 5 && <p>Skip (+{userGuesses.length + 1}s)</p>}
          {userGuesses.length === 5 && <p>Reveal</p>}
        </button>
        <button
          className={`w-28 p-4 rounded-full text-center text-black py-2 focus:outline-none ${
            isSubmitDisabled ? "bg-[#18b853]" : "bg-[#1fd660] hover:bg-[#18b853]"
          }`}
          disabled={isSubmitDisabled}
          onClick={handleAddGuess}
          title="Submit"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
