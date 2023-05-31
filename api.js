const express = require("express");
const router = express.Router();
const { DateTime } = require("luxon");
const cors = require("cors");
const axios = require("axios");
const querystring = require("querystring");
require("dotenv").config();
const crypto = require("crypto");
const bodyParser = require("body-parser");

const FirestoreSDK = require("./firebase");
const db = new FirestoreSDK();

router.use(cors());
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
	let timeZone = req.query.timeZone || "America/New_York";
	const now = DateTime.local().setZone(timeZone);
	const localDate = now.toFormat("yyyy-MM-dd");

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

/**
 * @api {post} /stats Add Game Stats
 * @apiName AddGameStats
 * @apiParam {Number} score The score to be added.
 * @apiParam {String} [falls back to timeZone="America/New_York"] The time zone to use for the date.
 * @apiSuccess {Boolean} success Indicates if the game stats were successfully added.
 */
router.post("/stats", async (req, res) => {
	const score = req.body.score;

	let timeZone = req.query.timeZone || "America/New_York";
	const now = DateTime.local().setZone(timeZone);
	const localDate = now.toFormat("yyyy-MM-dd");

	try {
		const todaysGameTrack = await db.getDocument("gameTracks", localDate);
		if (todaysGameTrack) {
			if (!(score >= 0 && score <= 6)) throw Error;
			todaysGameTrack.stats[score] = todaysGameTrack.stats[score] + 1;
			todaysGameTrack.totalPlays = todaysGameTrack.totalPlays + 1;
			await db.updateDocument("gameTracks", localDate, todaysGameTrack);
			res.json({ success: true });
		} else throw Error;
	} catch (err) {
		res.json({ success: false });
	}
});

/**
 * @api {get} /playlist/:playlistId/dailySong Get Daily Song
 * @apiName GetDailySong
 * @apiParam {String} timeZone The user's time zone.
 * @apiSuccess {String} song The name of the song.
 * @apiSuccess {String[]} artists The list of artists who performed the song.
 * @apiSuccess {Number} id The unique game id.
 * @apiSuccess {String} trackPreview The URL of the song preview (audio).
 * @apiSuccess {String} albumCover The URL of the album cover (image).
 * @apiSuccess {String} externalUrl The external URL of the song (spotify url).
 * @apiDescription This endpoint retrieves the daily song from a specified playlist.
 */
router.get("/playlist/:playlistId/dailySong", async (req, res) => {
	const playlistId = req.params.playlistId;
	const playlistObject = await db.getDocument("customPlaylists", playlistId);

	let timeZone = req.query.timeZone || "America/New_York";
	const now = DateTime.local().setZone(timeZone);
	const localDate = now.toFormat("yyyy-MM-dd");

	if (!playlistObject || req.query.r === "1") {
		// If no playlist object or refresh songs flag passed
		// Create or update playlist, tracklist, createdAt
		const accessToken = await fetchAccessToken();
		const response = await fetchSongsFromPlaylist(playlistId, accessToken);
		const sortedSongs =
			req.query.r && playlistObject
				? await sortPlaylistResponse(
						response,
						playlistObject.gameTracks
				  )
				: await sortPlaylistResponse(response);

		const songsToAdd = {
			tracklist: sortedSongs,
			snapshotId: `snapshot-${crypto.randomBytes(4).toString("hex")}`,
			gameTracks: [],
			createdAt: DateTime.now()
				.setZone("America/New_York")
				.toFormat("yyyy-MM-dd HH:mm:ss"),
			updatedAt: "",
		};

		if (req.query.r && playlistObject) {
			songsToAdd.gameTracks = playlistObject.gameTracks;
			songsToAdd.createdAt = playlistObject.createdAt;
			songsToAdd.updatedAt = DateTime.now()
				.setZone("America/New_York")
				.toFormat("yyyy-MM-dd HH:mm:ss");
			await db.updateDocument("customPlaylists", playlistId, songsToAdd);
		} else {
			await db.createDocument("customPlaylists", playlistId, songsToAdd);
		}
	} else {
		// Check if most recent game track = today
		const mostRecentGameTrack =
			playlistObject.gameTracks?.[playlistObject.gameTracks.length - 1];

		if (mostRecentGameTrack && mostRecentGameTrack.date === localDate) {
			return res.json({
				song: mostRecentGameTrack.song,
				artists: mostRecentGameTrack.artists,
				id: mostRecentGameTrack.id,
				trackPreview: mostRecentGameTrack.trackPreview,
				albumCover: mostRecentGameTrack.albumCover,
				externalUrl: mostRecentGameTrack.externalUrl,
			});
		}
	}

	// Check if refresh flag is true but the daily song was already chosen
	if (req.query.r && playlistObject) {
		const mostRecentGameTrack =
			playlistObject.gameTracks?.[playlistObject.gameTracks.length - 1];

		if (mostRecentGameTrack && mostRecentGameTrack.date === localDate) {
			return res.json({
				song: mostRecentGameTrack.song,
				artists: mostRecentGameTrack.artists,
				id: mostRecentGameTrack.id,
				trackPreview: mostRecentGameTrack.trackPreview,
				albumCover: mostRecentGameTrack.albumCover,
				externalUrl: mostRecentGameTrack.externalUrl,
			});
		}
	}

	// Choose new game track
	const updatedPlaylistObject = await db.getDocument(
		"customPlaylists",
		playlistId
	);
	const allTracksList = updatedPlaylistObject.tracklist;

	// Use while loop to make sure chosenTrack.playedBefore === false
	let randomTrackIndex;
	let chosenTrack;
	do {
		randomTrackIndex = Math.floor(Math.random() * allTracksList.length);
		chosenTrack = allTracksList[randomTrackIndex];
	} while (chosenTrack.playedBefore);

	const gameTracksList = updatedPlaylistObject.gameTracks;
	const gameId =
		gameTracksList.length > 0
			? gameTracksList[gameTracksList.length - 1].id + 1
			: 1;

	// Make modifications to `updatedPlaylistObject`
	const newGameTrack = {
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
	};

	updatedPlaylistObject.createdAt = DateTime.now()
		.setZone("America/New_York")
		.toFormat("yyyy-MM-dd HH:mm:ss");
	updatedPlaylistObject.gameTracks.push(newGameTrack);
	updatedPlaylistObject.tracklist[randomTrackIndex].playedBefore = true;
	await db.updateDocument(
		"customPlaylists",
		playlistId,
		updatedPlaylistObject
	);

	res.json({
		song: newGameTrack.song,
		artists: newGameTrack.artists,
		id: newGameTrack.id,
		trackPreview: newGameTrack.trackPreview,
		albumCover: newGameTrack.albumCover,
		externalUrl: newGameTrack.externalUrl,
	});
});

/**
 * @api {get} /playlist/:playlistId/allSongs Get All Songs for song search
 * @apiName GetAllSongs
 * @apiDescription Retrieves a list of all songs for the playlist.
 * @apiSuccess {Array} tracklist List of song objects {song: String, artists: String[]}.
 */
router.get("/playlist/:playlistId/allSongs", async (req, res) => {
	const playlistId = req.params.playlistId;

	const allTracks = await db.getDocument("customPlaylists", playlistId);
	const tracklist = allTracks.tracklist.map(({ song, artists }) => ({
		song,
		artists,
	}));
	res.json({
		tracklist: tracklist,
	});
});

/**
 * @api {post} /playlist/:playlistId/stats Add Game Stats
 * @apiName AddGameStats
 * @apiParam {Number} score The score to be added.
 * @apiParam {String} [falls back to timeZone="America/New_York"] The time zone to use for the date.
 * @apiSuccess {Boolean} success Indicates if the game stats were successfully added.
 */
router.post("/playlist/:playlistId/stats", async (req, res) => {
	const score = req.body.score;
	const playlistId = req.params.playlistId;

	let timeZone = req.query.timeZone || "America/New_York";
	const now = DateTime.local().setZone(timeZone);
	const localDate = now.toFormat("yyyy-MM-dd");

	try {
		const playlistObject = await db.getDocument(
			"customPlaylists",
			playlistId
		);
		let foundTrack = false;
		for (const track of playlistObject.gameTracks) {
			if (track.date === localDate) {
				track.totalPlays = track.totalPlays + 1;
				track.stats[score] = track.stats[score] + 1;

				foundTrack = true;
				await db.updateDocument(
					"customPlaylists",
					playlistId,
					playlistObject
				);
				res.json({ success: true });
			}
		}
		if (!foundTrack) throw Error;
	} catch (err) {
		res.json({ success: false });
	}
});

async function fetchAccessToken() {
	return new Promise(async (resolve, reject) => {
		const data = {
			grant_type: "client_credentials",
		};
		const options = {
			method: "POST",
			headers: {
				Authorization: `Basic ${process.env.SPOTIFY_CLIENT_KEY}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: querystring.stringify(data),
			url: "https://accounts.spotify.com/api/token",
		};
		const response = (await axios(options)).data;
		const accessToken = response.access_token;
		resolve(accessToken);
	});
}

async function fetchSongsFromPlaylist(playlistId, token) {
	return new Promise((resolve, reject) => {
		axios({
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			url: `https://api.spotify.com/v1/playlists/${playlistId}`,
		})
			.then(async (response) => {
				let data = response.data;
				if (data.tracks.next) {
					data.tracks.items = data.tracks.items.concat(
						await fetchTracks(data.tracks.next, token)
					);
				}
				resolve(data);
			})
			.catch((err) => reject(err));
	});
}

async function fetchTracks(nextUrl, token) {
	try {
		const response = await axios({
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			url: nextUrl,
		});
		let items = response.data.items;
		if (response.data.next) {
			items = items.concat(await fetchTracks(response.data.next, token));
		}
		return items;
	} catch (error) {
		console.error(error);
		return [];
	}
}

async function sortPlaylistResponse(response, pastGameTracks) {
	return new Promise((resolve, reject) => {
		const trackItems = response.tracks.items;
		const sortedSongs = [];

		[...trackItems].forEach(async (trackItem) => {
			const track = trackItem.track;
			const title = track.name;
			const artists = [];
			track.artists.forEach((artist) => {
				artists.push(artist.name);
			});
			const externalUrl = track.external_urls.spotify;
			const trackPreview = track.preview_url;
			const albumCover = track.album.images[0].url;
			const spotifyUri = track.id;
			const playedBefore = pastGameTracks
				? checkIfInGameTracks(externalUrl, pastGameTracks)
				: false;
			const document = {
				song: title,
				artists: artists,
				spotifyUri: spotifyUri,
				trackPreview: trackPreview,
				albumCover: albumCover,
				externalUrl: externalUrl,
				playedBefore: playedBefore,
			};
			if (trackPreview) sortedSongs.push(document);
		});

		resolve(sortedSongs);
	});
}

function checkIfInGameTracks(externalUrl, gameTracks) {
	for (const track of gameTracks) {
		if (track.externalUrl === externalUrl) return true;
	}
	return false;
}

module.exports = router;
