const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { DateTime } = require("luxon");

const FirestoreSDK = require("./firebase");
const db = new FirestoreSDK();

router.use(bodyParser.json());

/**
 * @api {get} /dailySong Get Daily Song
 * @apiName GetDailySong
 * @apiParam {String} timeZone The user's time zone.
 * @apiSuccess {String} song The name of the song.
 * @apiSuccess {String[]} artists The list of artists who performed the song.
 * @apiSuccess {Number} id The unique game id.
 * @apiSuccess {String} trackPreview The URL of the song preview (audio).
 * @apiSuccess {String} albumCover The URL of the album cover (image).
 * @apiSuccess {String} externalUrl The external URL of the song (spotify url).
 */
router.get("/dailySong", async (req, res) => {
	let timeZone = req.body.timeZone;

	const now = DateTime.local();
	let userDate;
	try {
		userDate = now.setZone(timeZone);
	} catch (err) {
		userDate = now.setZone("America/New_York");
	}
	const localDate = userDate.toFormat("yyyy-MM-dd");

	const dailyGameTrack = await db.getDocument("gameTracks", localDate);

	if (dailyGameTrack) {
		res.json({
			song: dailyGameTrack.song,
			artists: dailyGameTrack.artists,
			id: dailyGameTrack.id,
			trackPreview: dailyGameTrack.trackPreview,
			albumCover: dailyGameTrack.albumCover,
			externalUrl: dailyGameTrack.externalUrl,
		});
	} else {
		const mostRecentTracksSnapshot = await db.getLastDocument("allTracks");
		const mostRecentTracksTracklist =
			mostRecentTracksSnapshot.data.tracklist;

		const randomTrackIndex = Math.floor(
			Math.random() * mostRecentTracksTracklist.length
		);
		const chosenTrack = mostRecentTracksTracklist[randomTrackIndex];

		const mostRecentGameTrack = await db.getLastDocument("gameTracks");
		let gameId;
		if (mostRecentGameTrack) gameId = mostRecentGameTrack.data.id + 1;
		else gameId = 1;

		const date = DateTime.now()
			.setZone("America/New_York")
			.toFormat("yyyy-MM-dd HH:mm:ss");
		await db.createDocument("gameTracks", localDate, {
			song: chosenTrack.song,
			artists: chosenTrack.artists,
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
			createdAt: date,
		});

		// update playedBefore property of the chosen song to true
		mostRecentTracksTracklist[randomTrackIndex].playedBefore = true;
		const updatedDoc = {
			createdAt: mostRecentTracksSnapshot.id,
			snapshotId: mostRecentTracksSnapshot.data.snapshotId,
			tracklist: mostRecentTracksTracklist,
		};
		await db.updateDocument(
			"allTracks",
			mostRecentTracksSnapshot.id,
			updatedDoc
		);

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

/**
 * @api {get} /allSongs Get All Songs for song search
 * @apiName GetAllSongs
 * @apiDescription Retrieves a list of all songs in Firestore/allTracks.
 * @apiSuccess {Array} tracklist List of song objects {song: String, artists: String[]}.
 */
router.get("/allSongs", async (req, res) => {
	const allTracks = await db.getLastDocument("allTracks");
	const tracklist = allTracks.data.tracklist.map(({ song, artists }) => ({
		song,
		artists,
	}));
	res.json({
		tracklist: tracklist,
	});
});

module.exports = router;
