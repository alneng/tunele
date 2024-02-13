import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import Modal from "react-modal";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";
import PlaylistSearch from "../modules/PlaylistSearch";
import HelpModal from "../modules/HelpModal";
import StatsModal from "../modules/StatsModal";
import UserAccountModal from "../modules/UserAccountModal";
import Loader from "../modules/Loader";

import {
  calculateBarHeights,
  calculateStatsBottom,
} from "../utils/stats.utils";

import GameResult from "../types/GameResult";
import SavedGameData from "../types/SavedGameData";
import TrackGuessFormat from "../types/TrackGuessFormat";
import TrackFormat from "../types/TrackFormat";

interface StatsBarHeightsState {
  [key: number]: number;
}

const CustomGame: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
  const [song, setSong] = useState<string>("");
  const [artists, setArtists] = useState<string[]>([]);
  const [id, setId] = useState<number>(0);
  const [trackPreview, setTrackPreview] = useState<string>("");
  const [albumCover, setAlbumCover] = useState<string>("");
  const [externalUrl, setExternalUrl] = useState<string>("");
  const [songsInDb, setSongsInDb] = useState<TrackFormat[]>([]);
  const [userGuesses, setUserGuesses] = useState<TrackGuessFormat[]>([]);

  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [validPlaylist, setvalidPlaylist] = useState<boolean>(false);

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

  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem("firstTimeUser") !== "false") {
      localStorage.setItem("firstTimeUser", "false");
      setHelpModalState(true);
    }
  }, []);

  useEffect(() => {
    const queryParams = queryString.parse(location.search);
    const playlistId = queryString.parse(location.search).playlist;

    if (playlistId) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fetch(
        `${apiOrigin}/api/playlist/${playlistId}/dailySong?timeZone=${timezone}${
          queryParams.r ? "&r=1" : ""
        }`,
        { method: "GET" }
      )
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

          const customPlaylistObject = userData.custom[playlistId as string];
          const isLastDataObjectMatchingId =
            customPlaylistObject &&
            customPlaylistObject[customPlaylistObject.length - 1] &&
            customPlaylistObject[customPlaylistObject.length - 1].id ===
              data.id;

          setvalidPlaylist(true);
          setSong(data.song);
          setArtists(data.artists);
          setId(data.id);
          setTrackPreview(data.trackPreview);
          setAlbumCover(data.albumCover);
          setExternalUrl(data.externalUrl);

          if (isLastDataObjectMatchingId) {
            setUserGuesses(
              customPlaylistObject[customPlaylistObject.length - 1].guessList
            );
            if (
              customPlaylistObject[customPlaylistObject.length - 1].hasFinished
            ) {
              setGameFinished(true);
            }
          }

          fetch(`${apiOrigin}/api/playlist/${playlistId}/allSongs`, {
            method: "GET",
          })
            .then((response) => response.json())
            .then((data) => {
              setSongsInDb(data.tracklist);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    }
  }, [apiOrigin, location.search]);

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
      const playlistId = queryString.parse(location.search).playlist;
      fetch(`${apiOrigin}/api/playlist/${playlistId}/stats`, {
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
      id: id,
      score: score,
      guessList: newGuesses,
    };

    const data: SavedGameData = JSON.parse(
      localStorage.getItem("userData") ?? '{ "main": [], "custom": {} }'
    );

    const playlistId = queryString.parse(location.search).playlist;
    const playlistData = data.custom[playlistId as string];

    if (playlistData) {
      const isLastDataObjectMatchingId =
        playlistData.length > 0 &&
        playlistData[playlistData.length - 1].id === id;

      if (isLastDataObjectMatchingId) {
        playlistData[playlistData.length - 1] = todaysDataObject;
      } else {
        playlistData.push(todaysDataObject);
      }
      data.custom[playlistId as string] = playlistData;
    } else {
      data.custom[playlistId as string] = [todaysDataObject];
    }

    localStorage.setItem("userData", JSON.stringify(data));
  };

  useEffect(() => {
    const queryParams = queryString.parse(location.search);
    const playlistId = queryParams.playlist;
    const localData: SavedGameData = JSON.parse(
      localStorage.getItem("userData") ?? '{ "main": [], "custom": {} }'
    );

    if (playlistId && localData.custom[playlistId as string]) {
      const barHeights = calculateBarHeights(
        localData.custom[playlistId as string]
      );
      setStatsBarHeights(barHeights);

      const { statsNumCorrectString, statsCorrectPercentageString } =
        calculateStatsBottom(localData.custom[playlistId as string]);
      setStatsCorrectString(statsNumCorrectString);
      setStatsCorrectPercentageString(statsCorrectPercentageString);
    } else {
      setStatsBarHeights(Array(7).fill(0));
    }
  }, [isStatsModalOpen, location.search]);

  return (
    <div className="font-sf-pro">
      <NavBar
        setHelpModal={setHelpModalState}
        setStatsModal={setStatsModalState}
        setUAModel={setUserAccountModalState}
      />
      {!trackPreview && self.location.search.split("&")[1] === "r=1" && (
        <div id="loader">
          <Loader></Loader>
        </div>
      )}
      {!validPlaylist && (
        <div id="playlist-search">
          <PlaylistSearch></PlaylistSearch>
        </div>
      )}
      {!gameFinished && trackPreview && validPlaylist && (
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
            externalUrl={externalUrl}
          ></GameConclusion>
        </div>
      )}

      {/* modals */}
      <Modal
        isOpen={isHelpModalOpen}
        onRequestClose={onRequestCloseHelpModal}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <HelpModal
          onRequestCloseHelpModal={onRequestCloseHelpModal}
        ></HelpModal>
      </Modal>
      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={closeStatsModal}
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
        onRequestClose={closeUAModel}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <UserAccountModal apiOrigin={apiOrigin}></UserAccountModal>
      </Modal>
    </div>
  );
};

export default CustomGame;
