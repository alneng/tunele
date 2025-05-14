import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "react-modal";
import { useFirstTimeUser } from "@/hooks/user.hooks";
import { useGameStore } from "@/store/game.store";
import Navbar from "@/components/Navbar";
import Game from "@/components/Game";
import GameConclusion from "@/components/GameConclusion";
import PlaylistSearch from "@/components/PlaylistSearch";
import HelpModal from "@/components/HelpModal";
import StatsModal from "@/components/StatsModal";
import UserAccountModal from "@/components/UserAccountModal";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";

const CustomGame = () => {
  const { customGame, loadCustomGame, updateCustomGameGuesses, savedData } =
    useGameStore();
  const {
    isLoading,
    error,
    currentTrack,
    tracklist,
    userGuesses,
    isGameFinished,
    validPlaylist,
    playlistId,
  } = customGame;

  // Get URL parameters
  const [params] = useSearchParams();
  const playlistParam = params.get("playlist");
  const reloadParam = params.get("r") === "1";

  // Local state for modals
  const [isUserAccountModalOpen, setUserAccountModalState] =
    useState<boolean>(false);
  const [isHelpModalOpen, setHelpModalState] = useState<boolean>(false);
  const [isStatsModalOpen, setStatsModalState] = useState<boolean>(false);

  // Check for first-time users
  useFirstTimeUser(setHelpModalState);

  // Load custom game data when playlist parameter changes
  useEffect(() => {
    if (playlistParam) loadCustomGame(playlistParam, reloadParam);
  }, [playlistParam, reloadParam, loadCustomGame]);

  // Extract track data for rendering
  const song = currentTrack?.song || "";
  const artists = currentTrack?.artists || [];
  const id = currentTrack?.id || 0;
  const trackPreview = currentTrack?.trackPreview || "";
  const albumCover = currentTrack?.albumCover || "";
  const externalUrl = currentTrack?.externalUrl || "";

  return (
    <div className="font-sf-pro">
      <Navbar
        setHelpModal={setHelpModalState}
        setStatsModal={setStatsModalState}
        setUAModel={setUserAccountModalState}
      />
      {isLoading && <Loader />}
      {error && <ErrorMessage error={error} />}
      {!error && !isLoading && !validPlaylist && <PlaylistSearch />}
      {!error && !isGameFinished && trackPreview && validPlaylist && (
        <div id="game">
          <Game
            song={song}
            artists={artists}
            trackPreview={trackPreview}
            userGuesses={userGuesses}
            setUserGuesses={updateCustomGameGuesses}
            allSongs={tracklist}
          />
        </div>
      )}
      {!error && isGameFinished && trackPreview && (
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
        <HelpModal close={() => setHelpModalState(false)} />
      </Modal>
      <Modal
        isOpen={isStatsModalOpen}
        onRequestClose={() => setStatsModalState(false)}
        className="bg-[#131213] text-white border-gray-800 border-2 p-10 mx-auto max-w-xs md:max-w-lg text-center"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <StatsModal gameData={playlistId ? savedData.custom[playlistId] : []} />
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
