import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

const BaseGame: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
	const [song, setSong] = useState<string>("");
	const [artists, setArtists] = useState<string[]>([]);
	const [id, setId] = useState<number>(0);
	const [trackPreview, setTrackPreview] = useState<string>("");
	const [albumCover, setAlbumCover] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [songsInDb, setSongsInDb] = useState<trackFormat[]>([]);
	const [userGuesses, setUserGuesses] = useState<trackGuessFormat[]>([]);

	const [gameFinished, setGameFinished] = useState<boolean>(false);

	const [isHelpModalOpen, setHelpModalState] = useState(false);
	const [isStatsModalOpen, setStatsModalState] = useState(false);

	const closeHelpModal = () => {
		setHelpModalState(false);
	};
	const closeStatsModal = () => {
		setStatsModalState(false);
	};

	useEffect(() => {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		fetch(`${apiOrigin}/api/dailySong?timeZone=${timezone}`, {
			method: "GET",
		})
			.then((response) => response.json())
			.then((data) => {
				setSong(data.song);
				setArtists(data.artists);
				setId(data.id);
				setTrackPreview(data.trackPreview);
				setAlbumCover(data.albumCover);
				setExternalUrl(data.externalUrl);
			})
			.catch((err) => console.error(err));
		fetch(`${apiOrigin}/api/allSongs`, {
			method: "GET",
		})
			.then((response) => response.json())
			.then((data) => {
				setSongsInDb(data.tracklist);
			})
			.catch((err) => console.error(err));
	}, []);

	const handleUserGuessesUpdate = (newGuesses: trackGuessFormat[]) => {
		setUserGuesses(newGuesses);
		if (
			newGuesses[newGuesses.length - 1].isCorrect ||
			newGuesses.length >= 6
		) {
			setGameFinished(true);
		}
	};

	return (
		<div className="font-sf-pro">
			<NavBar
				setHelpModal={setHelpModalState}
				setStatsModal={setStatsModalState}
			/>
			{!gameFinished && (
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
			{gameFinished && (
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
				onRequestClose={closeHelpModal}
				className="modal"
				overlayClassName="overlay"
				ariaHideApp={false}
			>
				<div className="flex flex-col items-center">
					<p className="text-2xl font-semibold">How to Play</p>
					<div className="mt-6 mb-6">
						<p>Instructions</p>
					</div>
					<button
						onClick={closeHelpModal}
						className="mt-4 px-4 py-2 bg-gray-300 rounded-full"
					>
						Close
					</button>
				</div>
			</Modal>
			<Modal
				isOpen={isStatsModalOpen}
				onRequestClose={closeStatsModal}
				className="modal"
				overlayClassName="overlay"
				ariaHideApp={false}
			>
				<div className="flex flex-col items-center">
					<p className="text-2xl font-semibold">Your Stats</p>
					<div className="mt-6 mb-6">
						<p>Stats</p>
					</div>
					<button
						onClick={closeStatsModal}
						className="mt-4 px-4 py-2 bg-gray-300 rounded-full"
					>
						Close
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default BaseGame;
