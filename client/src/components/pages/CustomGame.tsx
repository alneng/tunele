import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";
import PlaylistSearch from "../modules/PlaylistSearch";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

const CustomGame: React.FC = () => {
	const [song, setSong] = useState<string>("");
	const [artists, setArtists] = useState<string[]>([]);
	const [id, setId] = useState<number>(0);
	const [trackPreview, setTrackPreview] = useState<string>("");
	const [albumCover, setAlbumCover] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [userGuesses, setUserGuesses] = useState<trackGuessFormat[]>([]);

	const location = useLocation();

	useEffect(() => {
		const queryParams = queryString.parse(location.search);
		const playlistId = queryParams.playlist;

		if (playlistId) {
			fetch(
				`http://localhost:7600/api/playlist/${playlistId}/dailySong`,
				{ method: "GET" }
			)
				.then((response) => response.json())
				.then((data) => {
					document
						.getElementById("playlist-search")
						?.classList.add("hidden");
					document.getElementById("game")?.classList.remove("hidden");

					setSong(data.song);
					setArtists(data.artists);
					setId(data.id);
					setTrackPreview(data.trackPreview);
					setAlbumCover(data.albumCover);
					setExternalUrl(data.externalUrl);
				})
				.catch((err) => console.error(err));
		}
	}, [location.search]);

	const handleUserGuessesUpdate = (newGuesses: trackGuessFormat[]) => {
		setUserGuesses(newGuesses);
		if (
			newGuesses[newGuesses.length - 1].isCorrect ||
			newGuesses.length >= 6
		) {
			// hide Game module and show GameConclusion module
		}
	};

	return (
		<div>
			<NavBar />
			<div className="" id="playlist-search">
				<PlaylistSearch></PlaylistSearch>
			</div>
			<div className="hidden" id="game">
				<Game
					song={song}
					artists={artists}
					trackPreview={trackPreview}
					albumCover={albumCover}
					userGuesses={userGuesses}
					setUserGuesses={handleUserGuessesUpdate}
				/>
			</div>
			{/* show after game is over */}
			<div className="hidden">
				<GameConclusion
					song={song}
					artists={artists}
					userGuesses={userGuesses}
					id={id}
					albumCover={albumCover}
					externalUrl={externalUrl}
				></GameConclusion>
			</div>
		</div>
	);
};

export default CustomGame;
