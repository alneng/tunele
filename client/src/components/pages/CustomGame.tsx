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

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

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
	const [songsInDb, setSongsInDb] = useState<trackFormat[]>([]);
	const [userGuesses, setUserGuesses] = useState<trackGuessFormat[]>([]);

	const [gameFinished, setGameFinished] = useState<boolean>(false);
	const [validPlaylist, setvalidPlaylist] = useState<boolean>(false);

	const [isUserAccountModalOpen, setUserAccountModalState] =
		useState<boolean>(false);
	const [isHelpModalOpen, setHelpModalState] = useState<boolean>(false);
	const [isStatsModalOpen, setStatsModalState] = useState<boolean>(false);
	const [statsBarHeights, setStatsBarHeights] =
		useState<StatsBarHeightsState>({});
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

	useEffect(() => {
		function countScores(array: any[]): { [key: number]: number } {
			const scoreCounts: { [key: number]: number } = {};
			for (let i = 1; i <= 6; i++) scoreCounts[i] = 0;
			scoreCounts[0] = 0;

			for (const item of array) {
				const score = item.score;
				scoreCounts[score] += 1;
			}

			return scoreCounts;
		}

		function mapObject(
			obj: { [key: string]: any },
			callback: (value: any, key: string) => any
		): { [key: string]: any } {
			return Object.keys(obj).reduce(
				(result: { [key: string]: any }, key: string) => {
					result[key] = callback(obj[key], key);
					return result;
				},
				{}
			);
		}

		function maxProp(obj: { [key: string]: number }): number {
			let maxValue = -Infinity;
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					const value = obj[key];
					if (value > maxValue) {
						maxValue = value;
					}
				}
			}
			return maxValue;
		}

		const calculateBarHeights = (localData: any, playlistId: any) => {
			const scores: {} = countScores(
				localData.custom[playlistId as string]
			);
			const max: number = maxProp(scores);
			if (max === 0) return Array(7).fill(0);
			return mapObject(scores, (value, _) => (value / max) * 100);
		};

		function calculateStatsBottom(localData: any, playlistId: any) {
			localData = localData.custom[playlistId as string];
			const totalLength = localData.length;
			let numCorrect = 0;
			for (const game of localData) {
				if (game.score > 0) numCorrect++;
			}
			const formattedString = `${numCorrect}/${totalLength}`;
			const formattedPercentageString = `${(
				(numCorrect / totalLength) *
				100
			).toFixed(1)}`;
			setStatsCorrectString(formattedString);
			setStatsCorrectPercentageString(formattedPercentageString);
		}

		const queryParams = queryString.parse(location.search);
		const playlistId = queryParams.playlist;
		const localData = JSON.parse(
			localStorage.getItem("userData") || "null"
		) || { main: [], custom: {} };

		if (playlistId && localData.custom[playlistId as string]) {
			const barHeights = calculateBarHeights(localData, playlistId);
			setStatsBarHeights(barHeights);
			calculateStatsBottom(localData, playlistId);
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
