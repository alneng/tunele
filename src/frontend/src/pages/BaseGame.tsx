import { useEffect, useState } from "react";
import { useFirstTimeUser } from "@/hooks/user.hooks";
import { useGameStore } from "@/store/game.store";
import Navbar from "@/components/Navbar";
import Game from "@/components/Game";
import GameConclusion from "@/components/GameConclusion";
import HelpModal from "@/components/HelpModal";
import StatsModal from "@/components/StatsModal";
import UserAccountModal from "@/components/UserAccountModal";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import TuneleModal from "@/components/TuneleModal";

const BaseGame = () => {
  const { mainGame, loadMainGame, updateMainGameGuesses, savedData } =
    useGameStore();
  const {
    isLoading,
    error,
    currentTrack,
    tracklist,
    userGuesses,
    isGameFinished,
  } = mainGame;

  // Local state for modals
  const [isUserAccountModalOpen, setUserAccountModalState] =
    useState<boolean>(false);
  const [isHelpModalOpen, setHelpModalState] = useState<boolean>(false);
  const [isStatsModalOpen, setStatsModalState] = useState<boolean>(false);

  // Check for first-time users
  useFirstTimeUser(setHelpModalState);

  // Load game data on component mount
  useEffect(() => {
    loadMainGame();
  }, [loadMainGame]);

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
      {!error && !isGameFinished && trackPreview && (
        <div id="game">
          <Game
            song={song}
            artists={artists}
            trackPreview={trackPreview}
            userGuesses={userGuesses}
            setUserGuesses={updateMainGameGuesses}
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
      <TuneleModal
        isOpen={isHelpModalOpen}
        onRequestClose={() => setHelpModalState(false)}
      >
        <HelpModal close={() => setHelpModalState(false)} />
      </TuneleModal>
      <TuneleModal
        isOpen={isStatsModalOpen}
        onRequestClose={() => setStatsModalState(false)}
      >
        <StatsModal gameData={savedData.main} />
      </TuneleModal>
      <TuneleModal
        isOpen={isUserAccountModalOpen}
        onRequestClose={() => setUserAccountModalState(false)}
      >
        <UserAccountModal />
      </TuneleModal>
    </div>
  );
};

export default BaseGame;
