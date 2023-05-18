import React, { useEffect, useState } from "react";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";

import trackGuessFormat from "../interfaces/TrackGuessFormat";
import trackFormat from "../interfaces/TrackFormat";

const BaseGame: React.FC = () => {
	const [song, setSong] = useState<string>("");
	const [artists, setArtists] = useState<string[]>([]);
	const [id, setId] = useState<number>(0);
	const [trackPreview, setTrackPreview] = useState<string>("");
	const [albumCover, setAlbumCover] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
	const [songsInDb, setSongsInDb] = useState<trackFormat[]>([]);
	const [userGuesses, setUserGuesses] = useState<trackGuessFormat[]>([]);

	useEffect(() => {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		fetch(`http://localhost:7600/api/dailySong?timeZone=${timezone}`, {
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
		fetch(`http://localhost:7600/api/allSongs`, {
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
			// hide Game module and show GameConclusion module
			document.getElementById("game")?.classList.add("hidden");
			document.getElementById("conclusion")?.classList.remove("hidden");
		}
	};

	return (
		<div className="font-sf-pro">
			<NavBar />
			<div className="" id="game">
				<Game
					song={song}
					artists={artists}
					trackPreview={trackPreview}
					userGuesses={userGuesses}
					setUserGuesses={handleUserGuessesUpdate}
					allSongs={songsInDb}
				/>
			</div>
			{/* show after game is over */}
			<div className="hidden" id="conclusion">
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

export default BaseGame;
