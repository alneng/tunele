import React, { useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import useFetchMainPlaylist from "../hooks/useFetchMainPlaylist";
import useFirstTimeUser from "../hooks/useFirstTimeUser";
import useLoadUserData from "../hooks/useLoadUserData";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";
import HelpModal from "../modules/HelpModal";
import StatsModal from "../modules/StatsModal";
import UserAccountModal from "../modules/UserAccountModal";
import Loader from "../modules/Loader";
import ErrorMessage from "../modules/ErrorMessage";

import {
  calculateBarHeights,
  calculateStatsBottom,
} from "../utils/stats.utils";
import { fetchSavedData, mergeGameData } from "../utils/saved-data.utils";

import GameResult from "../types/GameResult";
import TrackGuessFormat from "../types/TrackGuessFormat";

interface StatsBarHeightsState {
  [key: number]: number;
}

const BaseGame: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
  const [userGuesses, setUserGuesses] = useState<TrackGuessFormat[]>([]);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const { main, custom } = useLoadUserData(userGuesses);
  const existingGameId = useRef<number>();
  const { loading, data, error } = useFetchMainPlaylist(apiOrigin);
  const {
    song,
    artists,
    id,
    trackPreview,
    albumCover,
    externalUrl,
    songsInDb,
  } = data;

  const [isUserAccountModalOpen, setUserAccountModalState] =
    useState<boolean>(false);
  const [isHelpModalOpen, setHelpModalState] = useState<boolean>(false);
  const [isStatsModalOpen, setStatsModalState] = useState<boolean>(false);
  const [statsBarHeights, setStatsBarHeights] = useState<StatsBarHeightsState>(
    {}
  );
  const [statsCorrectString, setStatsCorrectString] = useState<string>("0/0");
  const [statsCorrectPercentageString, setStatsCorrectPercentageString] =
    useState<string>("0.0");

  useFirstTimeUser(setHelpModalState);

  // Load existing game data from local storage
  useEffect(() => {
    if (existingGameId.current !== id) {
      const isLastDataObjectMatchingId =
        Array.isArray(main) &&
        main.length > 0 &&
        main[main.length - 1].id === id;

      if (isLastDataObjectMatchingId) {
        setUserGuesses(main[main.length - 1].guessList);
        if (main[main.length - 1].hasFinished) {
          setGameFinished(true);
        }
      }

      existingGameId.current = id;
    }
  }, [main, id]);

  // Update stats modal data when it's opened
  useEffect(() => {
    if (main) {
      const barHeights = calculateBarHeights(main);
      setStatsBarHeights(barHeights);

      const { statsNumCorrectString, statsCorrectPercentageString } =
        calculateStatsBottom(main);
      setStatsCorrectString(statsNumCorrectString);
      setStatsCorrectPercentageString(statsCorrectPercentageString);
    } else {
      setStatsBarHeights(Array(7).fill(0));
    }
  }, [isStatsModalOpen, main]);

  const handleUserGuessesUpdate = (newGuesses: TrackGuessFormat[]) => {
    setUserGuesses(newGuesses);

    const isGameFinished =
      newGuesses[newGuesses.length - 1].isCorrect || newGuesses.length >= 6;
    const score =
      isGameFinished && newGuesses[newGuesses.length - 1].isCorrect
        ? newGuesses.length
        : 0;

    if (isGameFinished) {
      setGameFinished(true);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fetch(`${apiOrigin}/api/stats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: score,
          timeZone: timezone,
        }),
      });
    }

    const todaysDataObject: GameResult = {
      hasFinished: isGameFinished,
      hasStarted: true,
      id,
      score,
      guessList: newGuesses,
    };

    const updatedData = { main, custom };
    const playlistData = updatedData.main;

    const isLastDataObjectMatchingId =
      playlistData.length > 0 &&
      playlistData[playlistData.length - 1].id === id;

    if (isLastDataObjectMatchingId) {
      playlistData[playlistData.length - 1] = todaysDataObject;
    } else {
      playlistData.push(todaysDataObject);
    }

    const dataToSave = mergeGameData(updatedData, fetchSavedData());
    localStorage.setItem("userData", JSON.stringify(dataToSave));
  };

  return (
    <div className="font-sf-pro">
      <NavBar
        setHelpModal={setHelpModalState}
        setStatsModal={setStatsModalState}
        setUAModel={setUserAccountModalState}
      />
      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!error && !gameFinished && trackPreview && (
        <div id="game">
          <Game
            song={song}
            artists={artists}
            trackPreview={trackPreview}
            userGuesses={userGuesses}
            setUserGuesses={handleUserGuessesUpdate}
            allSongs={songsInDb}
          />
        </div>
      )}
      {!error && gameFinished && trackPreview && (
        <div id="conclusion">
          <GameConclusion
            song={song}
            artists={artists}
            userGuesses={userGuesses}
            id={id}
            albumCover={albumCover}
            externalUrl={externalUrl}
          />
        </div>
      )}

      {/* modals */}
      <Modal
        isOpen={isHelpModalOpen}
        onRequestClose={() => setHelpModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <HelpModal
          onRequestCloseHelpModal={() => setHelpModalState(false)}
        ></HelpModal>
      </Modal>
      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={() => setStatsModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <StatsModal
          statsBarHeights={statsBarHeights}
          statsCorrectString={statsCorrectString}
          statsCorrectPercentageString={statsCorrectPercentageString}
        ></StatsModal>
      </Modal>
      <Modal
        isOpen={isUserAccountModalOpen}
        onRequestClose={() => setUserAccountModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <UserAccountModal apiOrigin={apiOrigin}></UserAccountModal>
      </Modal>
    </div>
  );
};

export default BaseGame;
