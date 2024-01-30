const crypto = require("crypto");
const { DateTime } = require("luxon");
const db = require("../utils/firebase.utils");
const { fetchSongsFromPlaylist } = require("./spotify.utils");

/**
 * Generates or refreshes a custom game playlist object
 *
 * @param playlistId the id of the playlist
 * @param playlistObject existing playlist game data, if any
 * @param refreshFlag if playlist should be updated with new songs from Spotify api
 * @returns a custom game playlist object
 */
async function refreshPlaylist(playlistId, playlistObject, refreshFlag) {
  const response = await fetchSongsFromPlaylist(playlistId);
  const sortedSongs =
    refreshFlag && playlistObject
      ? await sortPlaylistResponse(response, playlistObject.gameTracks)
      : await sortPlaylistResponse(response);

  const updatedPlaylistObject = {
    tracklist: sortedSongs,
    snapshotId: `snapshot-${crypto.randomBytes(4).toString("hex")}`,
    gameTracks: [],
    createdAt: DateTime.now()
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss"),
    updatedAt: "",
  };

  if (refreshFlag && playlistObject) {
    updatedPlaylistObject.gameTracks = playlistObject.gameTracks;
    updatedPlaylistObject.createdAt = playlistObject.createdAt;
    updatedPlaylistObject.updatedAt = DateTime.now()
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss");
    await db.updateDocument(
      "customPlaylists",
      playlistId,
      updatedPlaylistObject
    );
  } else {
    await db.createDocument(
      "customPlaylists",
      playlistId,
      updatedPlaylistObject
    );
  }

  return await db.getDocument("customPlaylists", playlistId);
}

/**
 * Gets an existing game track
 *
 * @param playlistObject existing playlist game data
 * @param localDate the date of the track to get
 * @returns an existing game track, or null if it does not exist
 */
function getExistingGameTrack(playlistObject, localDate) {
  const recentGameTrack =
    playlistObject.gameTracks?.[playlistObject.gameTracks.length - 1];
  const secondRecentGameTrack =
    playlistObject.gameTracks.length > 1
      ? playlistObject.gameTracks?.[playlistObject.gameTracks.length - 2]
      : null;

  if (
    (recentGameTrack && recentGameTrack.date === localDate) ||
    (secondRecentGameTrack && secondRecentGameTrack.date === localDate)
  ) {
    return recentGameTrack.date === localDate
      ? recentGameTrack
      : secondRecentGameTrack;
  }

  return null;
}

/**
 * Selects a new game track
 *
 * @param playlistId the id of the playlist
 * @param playlistObject existing playlist game data
 * @param localDate the date of the track to choose for
 * @returns the selected game track
 */
async function chooseNewGameTrack(playlistId, playlistObject, localDate) {
  let allTracksList = playlistObject.tracklist;

  if (allTracksList.filter((song) => !song.playedBefore).length === 0) {
    allTracksList = resetTrackListPlayedBeforeStatus(allTracksList);
  }

  let randomTrackIndex, chosenTrack;
  do {
    randomTrackIndex = Math.floor(Math.random() * allTracksList.length);
    chosenTrack = allTracksList[randomTrackIndex];
  } while (chosenTrack.playedBefore);

  const gameId =
    playlistObject.gameTracks.length > 0
      ? playlistObject.gameTracks[playlistObject.gameTracks.length - 1].id + 1
      : 1;

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

  playlistObject.updatedAt = DateTime.now()
    .setZone("America/New_York")
    .toFormat("yyyy-MM-dd HH:mm:ss");
  playlistObject.gameTracks.push(newGameTrack);
  playlistObject.tracklist[randomTrackIndex].playedBefore = true;
  await db.updateDocument("customPlaylists", playlistId, playlistObject);

  return newGameTrack;
}

/**
 * Merges all songs of a Spotify playlist with the existing game tracks of a custom game.
 * Accounts for whether game tracks have been already played before
 *
 * @param response songs from a Spotify playlist, in Spotify object track format
 * @param pastGameTracks existing game tracks, if any
 * @returns a new list of game tracks
 */
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
      const playedBefore = checkIfInGameTracks(externalUrl, pastGameTracks);
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

/**
 * Checks if a track has been played before in a game
 *
 * @param externalUrl url of the Spotify track
 * @param gameTracks existing game tracks, if any
 * @returns has a game track has been played before
 */
function checkIfInGameTracks(externalUrl, gameTracks) {
  if (!gameTracks) return false;
  for (const track of gameTracks) {
    if (track.externalUrl === externalUrl) return true;
  }
  return false;
}

/**
 * Resets the playedBefore status of all tracks in the track list.
 * Warning: This action is irreversible
 *
 * @param trackList the track list to reset the status of
 * @returns the new track list of reset statuses
 */
function resetTrackListPlayedBeforeStatus(trackList) {
  return trackList.map((track) => ({
    ...track,
    playedBefore: false,
  }));
}

module.exports = { refreshPlaylist, getExistingGameTrack, chooseNewGameTrack };
