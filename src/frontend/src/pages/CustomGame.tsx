import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { useFetchCustomPlaylist } from "../hooks/game.hooks";
import { useFirstTimeUser, useLoadUserData } from "../hooks/user.hooks";
import {
  calculateBarHeights,
  calculateStatsBottom,
  NumberToNumberMapping,
} from "../utils/stats.utils";
import { fetchSavedData, mergeGameData } from "../utils/data.utils";
import { postCustomGameStats } from "../api/game";
import { GameResult, TrackGuess } from "../types";
import NavBar from "../components/Navbar";
import Game from "../components/Game";
import GameConclusion from "../components/GameConclusion";
import PlaylistSearch from "../components/PlaylistSearch";
import HelpModal from "../components/HelpModal";
import StatsModal from "../components/StatsModal";
import UserAccountModal from "../components/UserAccountModal";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const CustomGame: React.FC = () => {
  const [userGuesses, setUserGuesses] = useState<TrackGuess[]>([]);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const { main, custom } = useLoadUserData(userGuesses);
  const existingGameId = useRef<number>();

  const [params] = useSearchParams();
  const { data, isLoading, error } = useFetchCustomPlaylist(
    params.get("playlist"),
    params.get("r")
  );
  const {
    validPlaylist,
    playlistId,
    song,
    artists,
    id,
    trackPreview,
    albumCover,
    externalUrl,
    tracklist,
  } = data;

  const [isUserAccountModalOpen, setUserAccountModalState] =
    useState<boolean>(false);
  const [isHelpModalOpen, setHelpModalState] = useState<boolean>(false);
  const [isStatsModalOpen, setStatsModalState] = useState<boolean>(false);
  const [statsBarHeights, setStatsBarHeights] = useState<NumberToNumberMapping>(
    {}
  );
  const [statsCorrectString, setStatsCorrectString] = useState<string>("0/0");
  const [statsCorrectPercentageString, setStatsCorrectPercentageString] =
    useState<string>("0.0");

  useFirstTimeUser(setHelpModalState);

  // Load existing game data from local storage
  useEffect(() => {
    if (existingGameId.current !== id) {
      const customPlaylistObject = custom[playlistId];
      const isLastDataObjectMatchingId =
        Array.isArray(customPlaylistObject) &&
        customPlaylistObject.length > 0 &&
        customPlaylistObject[customPlaylistObject.length - 1].id === id;

      if (isLastDataObjectMatchingId) {
        setUserGuesses(
          customPlaylistObject[customPlaylistObject.length - 1].guessList
        );
        if (customPlaylistObject[customPlaylistObject.length - 1].hasFinished) {
          setGameFinished(true);
        }
      }

      existingGameId.current = id;
    }
  }, [custom, id, playlistId]);

  // Update stats modal data when it's opened
  useEffect(() => {
    if (playlistId && custom[playlistId]) {
      const barHeights = calculateBarHeights(custom[playlistId]);
      setStatsBarHeights(barHeights);

      const { statsNumCorrectString, statsCorrectPercentageString } =
        calculateStatsBottom(custom[playlistId]);
      setStatsCorrectString(statsNumCorrectString);
      setStatsCorrectPercentageString(statsCorrectPercentageString);
    } else {
      setStatsBarHeights(Array(7).fill(0));
    }
  }, [isStatsModalOpen, playlistId, gameFinished, custom]);

  const handleUserGuessesUpdate = (newGuesses: TrackGuess[]) => {
    setUserGuesses(newGuesses);

    const isGameFinished =
      newGuesses[newGuesses.length - 1].isCorrect || newGuesses.length >= 6;
    const score =
      isGameFinished && newGuesses[newGuesses.length - 1].isCorrect
        ? newGuesses.length
        : 0;

    if (isGameFinished) {
      setGameFinished(true);
      postCustomGameStats(playlistId, score);
    }

    const todaysDataObject: GameResult = {
      hasFinished: isGameFinished,
      hasStarted: true,
      id,
      score,
      guessList: newGuesses,
    };

    const updatedData = { main, custom };
    const playlistData = updatedData.custom[playlistId];

    if (playlistData) {
      const isLastDataObjectMatchingId =
        playlistData.length > 0 &&
        playlistData[playlistData.length - 1].id === id;

      if (isLastDataObjectMatchingId) {
        playlistData[playlistData.length - 1] = todaysDataObject;
      } else {
        playlistData.push(todaysDataObject);
      }
      updatedData.custom[playlistId] = playlistData;
    } else {
      updatedData.custom[playlistId] = [todaysDataObject];
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
      {isLoading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {!error && !isLoading && !validPlaylist && <PlaylistSearch />}
      {!error && !gameFinished && trackPreview && validPlaylist && (
        <div id="game">
          <Game
            song={song}
            artists={artists}
            trackPreview={trackPreview}
            userGuesses={userGuesses}
            setUserGuesses={handleUserGuessesUpdate}
            allSongs={tracklist}
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
        <HelpModal onRequestCloseHelpModal={() => setHelpModalState(false)} />
      </Modal>
      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={() => setStatsModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <StatsModal
          playlistId={playlistId}
          statsBarHeights={statsBarHeights}
          statsCorrectString={statsCorrectString}
          statsCorrectPercentageString={statsCorrectPercentageString}
        />
      </Modal>
      <Modal
        isOpen={isUserAccountModalOpen}
        onRequestClose={() => setUserAccountModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <UserAccountModal />
      </Modal>
    </div>
  );
};

export default CustomGame;
