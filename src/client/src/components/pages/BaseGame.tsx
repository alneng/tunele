import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";
import HelpModal from "../modules/HelpModal";
import StatsModal from "../modules/StatsModal";
import UserAccountModal from "../modules/UserAccountModal";
import Loader from "../modules/Loader";

import {
  calculateBarHeights,
  calculateStatsBottom,
} from "../utils/stats.utils";

import SavedGameData from "../interfaces/SavedGameData";
import TrackGuessFormat from "../interfaces/TrackGuessFormat";
import TrackFormat from "../interfaces/TrackFormat";

interface StatsBarHeightsState {
  [key: number]: number;
}

const BaseGame: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
  const [song, setSong] = useState<string>("");
  const [artists, setArtists] = useState<string[]>([]);
  const [id, setId] = useState<number>(0);
  const [trackPreview, setTrackPreview] = useState<string>("");
  const [albumCover, setAlbumCover] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [songsInDb, setSongsInDb] = useState<TrackFormat[]>([]);
  const [userGuesses, setUserGuesses] = useState<TrackGuessFormat[]>([]);

  const [gameFinished, setGameFinished] = useState<boolean>(false);

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

  const onRequestCloseHelpModal = () => {
    setHelpModalState(false);
  };
  const closeStatsModal = () => {
    setStatsModalState(false);
  };
  const closeUAModel = () => {
    setUserAccountModalState(false);
  };

  useEffect(() => {
    fetchData();
    fetchAllSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localStorage.getItem("firstTimeUser") !== "false") {
      localStorage.setItem("firstTimeUser", "false");
      setHelpModalState(true);
    }
  }, []);

  const fetchData = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`${apiOrigin}/api/dailySong?timeZone=${timezone}`)
      .then((response) => response.json())
      .then((data) => {
        const userData = JSON.parse(
          localStorage.getItem("userData") || "null"
        ) || { main: [], custom: {} };
        if (!localStorage.getItem("userData")) {
          localStorage.setItem(
            "userData",
            JSON.stringify({ main: [], custom: {} })
          );
        }

        const isLastDataObjectMatchingId =
          Array.isArray(userData.main) &&
          userData.main.length > 0 &&
          userData.main[userData.main.length - 1].id === data.id;

        setSong(data.song);
        setArtists(data.artists);
        setId(data.id);
        setTrackPreview(data.trackPreview);
        setAlbumCover(data.albumCover);
        setExternalUrl(data.externalUrl);

        if (isLastDataObjectMatchingId) {
          setUserGuesses(userData.main[userData.main.length - 1].guessList);
          if (userData.main[userData.main.length - 1].hasFinished) {
            setGameFinished(true);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  const fetchAllSongs = () => {
    fetch(`${apiOrigin}/api/allSongs`)
      .then((response) => response.json())
      .then((data) => {
        setSongsInDb(data.tracklist);
      })
      .catch((err) => console.error(err));
  };

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

    const todaysDataObject = {
      hasFinished: isGameFinished,
      hasStarted: true,
      id: id,
      score: score,
      guessList: newGuesses,
    };

    const data = JSON.parse(localStorage.getItem("userData") || "null") || {
      main: [],
      custom: {},
    };

    const isLastDataObjectMatchingId =
      Array.isArray(data.main) &&
      data.main.length > 0 &&
      data.main[data.main.length - 1].id === id;

    if (isLastDataObjectMatchingId) {
      data.main[data.main.length - 1] = todaysDataObject;
    } else {
      data.main.push(todaysDataObject);
    }

    localStorage.setItem("userData", JSON.stringify(data));
  };

  useEffect(() => {
    const localData: SavedGameData = JSON.parse(
      localStorage.getItem("userData") ?? '{ "main": [], "custom": {} }'
    );

    if (localData) {
      const barHeights = calculateBarHeights(localData.main);
      setStatsBarHeights(barHeights);

      const { statsNumCorrectString, statsCorrectPercentageString } =
        calculateStatsBottom(localData.main);
      setStatsCorrectString(statsNumCorrectString);
      setStatsCorrectPercentageString(statsCorrectPercentageString);
    } else {
      setStatsBarHeights(Array(7).fill(0));
    }
  }, [isStatsModalOpen]);

  return (
    <div className="font-sf-pro">
      <NavBar
        setHelpModal={setHelpModalState}
        setStatsModal={setStatsModalState}
        setUAModel={setUserAccountModalState}
      />
      {!trackPreview && (
        <div id="loader">
          <Loader></Loader>
        </div>
      )}
      {!gameFinished && trackPreview && (
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
      {gameFinished && trackPreview && (
        <div id="conclusion">
          <GameConclusion
            song={song}
            artists={artists}
            userGuesses={userGuesses}
            id={id}
            albumCover={albumCover}
            externalUrl={externalUrl}></GameConclusion>
        </div>
      )}

      {/* modals */}
      <Modal
        isOpen={isHelpModalOpen}
        onRequestClose={onRequestCloseHelpModal}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}>
        <HelpModal
          onRequestCloseHelpModal={onRequestCloseHelpModal}></HelpModal>
      </Modal>
      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={closeStatsModal}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}>
        <StatsModal
          statsBarHeights={statsBarHeights}
          statsCorrectString={statsCorrectString}
          statsCorrectPercentageString={
            statsCorrectPercentageString
          }></StatsModal>
      </Modal>
      <Modal
        isOpen={isUserAccountModalOpen}
        onRequestClose={closeUAModel}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}>
        <UserAccountModal apiOrigin={apiOrigin}></UserAccountModal>
      </Modal>
    </div>
  );
};

export default BaseGame;
