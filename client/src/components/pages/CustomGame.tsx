import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import Modal from "react-modal";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";
import PlaylistSearch from "../modules/PlaylistSearch";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

const CustomGame: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
	const [song, setSong] = useState<string>("");
	const [artists, setArtists] = useState<string[]>([]);
	const [id, setId] = useState<number>(0);
	const [trackPreview, setTrackPreview] = useState<string>("");
	const [albumCover, setAlbumCover] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [songsInDb, setSongsInDb] = useState<trackFormat[]>([]);
	const [userGuesses, setUserGuesses] = useState<trackGuessFormat[]>([]);

	const [gameFinished, setGameFinished] = useState<boolean>(false);
	const [validPlaylist, setvalidPlaylist] = useState<boolean>(false);

	const [isHelpModalOpen, setHelpModalState] = useState(false);
	const [isStatsModalOpen, setStatsModalState] = useState(false);

	const closeHelpModal = () => {
		setHelpModalState(false);
	};
	const closeStatsModal = () => {
		setStatsModalState(false);
	};

	const location = useLocation();

	useEffect(() => {
		const queryParams = queryString.parse(location.search);
		const playlistId = queryParams.playlist;

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

					const customPlaylistObject =
						userData.custom[playlistId as string];
					const isLastDataObjectMatchingId =
						customPlaylistObject &&
						customPlaylistObject[customPlaylistObject.length - 1] &&
						customPlaylistObject[customPlaylistObject.length - 1]
							.id === data.id;

					setvalidPlaylist(true);
					setSong(data.song);
					setArtists(data.artists);
					setId(data.id);
					setTrackPreview(data.trackPreview);
					setAlbumCover(data.albumCover);
					setExternalUrl(data.externalUrl);

					if (isLastDataObjectMatchingId) {
						setUserGuesses(
							customPlaylistObject[
								customPlaylistObject.length - 1
							].guessList
						);
						if (
							customPlaylistObject[
								customPlaylistObject.length - 1
							].hasFinished
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
	}, [location.search]);

	const handleUserGuessesUpdate = (newGuesses: trackGuessFormat[]) => {
		setUserGuesses(newGuesses);

		const isGameFinished =
			newGuesses[newGuesses.length - 1].isCorrect ||
			newGuesses.length >= 6;
		const score = isGameFinished ? newGuesses.length : 0;

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

		const todaysDataObject = {
			hasFinished: isGameFinished,
			hasStarted: true,
			id: id,
			score: score,
			guessList: newGuesses,
		};

		let data = JSON.parse(localStorage.getItem("userData") || "null") || {
			main: [],
			custom: [],
		};

		const playlistId = queryString.parse(location.search).playlist;
		const playlistData = data.custom[playlistId as string];

		if (playlistData) {
			const isLastDataObjectMatchingId =
				Array.isArray(playlistData) &&
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

	return (
		<div className="font-sf-pro">
			<NavBar
				setHelpModal={setHelpModalState}
				setStatsModal={setStatsModalState}
			/>
			{!validPlaylist && (
				<div id="playlist-search">
					<PlaylistSearch></PlaylistSearch>
				</div>
			)}
			{!gameFinished && validPlaylist && (
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
					<p className="text-2xl font-semibold">
						Your Stats (Custom)
					</p>
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

export default CustomGame;
