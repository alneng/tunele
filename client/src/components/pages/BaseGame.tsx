import React, { useEffect, useState } from "react";

import NavBar from "../modules/Navbar";
import Game from "../modules/Game";
import GameConclusion from "../modules/GameConclusion";

import trackGuessFormat from "../interfaces/TrackGuessFormat";

const BaseGame: React.FC = () => {
	const [song, setSong] = useState<string>("");
	const [artists, setArtists] = useState<string[]>([]);
	const [id, setId] = useState<number>(0);
	const [trackPreview, setTrackPreview] = useState<string>("");
	const [albumCover, setAlbumCover] = useState<string>("");
	const [externalUrl, setExternalUrl] = useState<string>("");
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
	}, []);

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
			<div className="">
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
			<div className="">
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
