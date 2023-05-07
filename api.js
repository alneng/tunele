const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const FirestoreSDK = require("./firebase");
const db = new FirestoreSDK();

router.use(bodyParser.json());

router.get("/dailySong", async (req, res) => {
	let timeZone = req.body.timeZone;

	const now = new Date();
	let userDate;
	try {
		userDate = new Date(
			now.toLocaleString("en-US", { timeZone: timeZone })
		);
	} catch (err) {
		userDate = new Date(
			now.toLocaleString("en-US", { timeZone: "America/New_York" })
		);
	}
	const localDate = userDate.toISOString().slice(0, 10); // YYYY-MM-DD

	const gameTracks = await db.getAllDocuments("gameTracks");
	const mostRecentGameTrack = gameTracks[gameTracks.length - 1];
	const secondMostRecentGameTrack = gameTracks[gameTracks.length - 2];

	if (mostRecentGameTrack && mostRecentGameTrack.date === localDate) {
		res.json({
			song: mostRecentGameTrack.song,
			artists: mostRecentGameTrack.artists,
			id: mostRecentGameTrack.id,
			trackPreview: mostRecentGameTrack.trackPreview,
			albumCover: mostRecentGameTrack.albumCover,
			externalUrl: mostRecentGameTrack.externalUrl,
		});
	} else if (
		secondMostRecentGameTrack &&
		secondMostRecentGameTrack.date === localDate
	) {
		res.json({
			song: secondMostRecentGameTrack.song,
			artists: secondMostRecentGameTrack.artists,
			id: secondMostRecentGameTrack.id,
			trackPreview: secondMostRecentGameTrack.trackPreview,
			albumCover: secondMostRecentGameTrack.albumCover,
			externalUrl: secondMostRecentGameTrack.externalUrl,
		});
	} else {
		const newTracks = await db.getAllDocuments("allTracks", {
			playedBefore: false,
		});
		const chooseRandomTrack = (arr) =>
			arr[Math.floor(Math.random() * arr.length)];
		const chosenTrack = chooseRandomTrack(newTracks);

		const gameId = gameTracks.length + 1;
		await db.createDocument("gameTracks", localDate, {
			song: chosenTrack.song,
			artist: chosenTrack.artists,
			date: localDate,
			id: gameId,
			totalPlays: 0,
			trackPreview: chosenTrack.trackPreview,
			albumCover: chosenTrack.albumCover,
			externalUrl: chosenTrack.externalUrl,
			stats: {
				0: 0,
				1: 0,
				2: 0,
				3: 0,
				4: 0,
				5: 0,
				6: 0,
			},
		});

		// update playedBefore to true
		const songSummary = `${chosenTrack.song} - ${chosenTrack.artists.join(
			", "
		)}`;
		chosenTrack.playedBefore = true;
		await db.updateDocument("allTracks", songSummary, chosenTrack);

		// return track info to user
		res.json({
			song: chosenTrack.song,
			artists: chosenTrack.artists,
			id: gameId,
			trackPreview: chosenTrack.trackPreview,
			albumCover: chosenTrack.albumCover,
			externalUrl: chosenTrack.externalUrl,
		});
	}
});

router.get("/allSongs", async (req, res) => {
	const allTracks = await db.getAllDocuments("allTracks");
	res.json({
		trackList: allTracks,
	});
});

module.exports = router;
