import crypto from "crypto";
import { DateTime } from "luxon";
import db from "./firebase.utils";
import { fetchSongsFromPlaylist } from "./spotify.utils";

import CustomPlaylistSchema from "../types/CustomPlaylistSchema";
import GameTrackSchema from "../types/GameTrackSchema";
import {
  SpotifyPlaylistObject,
  PlaylistTrackObject,
  TrackObject,
} from "../types/spotify-types";
import TrackSchema from "../types/TrackSchema";

/**
 * Generates or refreshes a custom game playlist object
 *
 * @param playlistId the id of the playlist
 * @param playlistObject existing playlist game data, if any
 * @param refreshFlag if playlist should be updated with new songs from Spotify api
 * @returns a custom game playlist object
 */
export async function refreshPlaylist(
  playlistId: string,
  playlistObject: CustomPlaylistSchema,
  refreshFlag: boolean
): Promise<CustomPlaylistSchema> {
  const response = await fetchSongsFromPlaylist(playlistId);
  const sortedSongs: TrackSchema[] =
    refreshFlag && playlistObject
      ? await sortPlaylistResponse(response, playlistObject.gameTracks)
      : await sortPlaylistResponse(response);

  const updatedPlaylistObject: CustomPlaylistSchema = {
    createdAt: DateTime.now()
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss"),
    snapshotId: `snapshot-${crypto.randomBytes(4).toString("hex")}`,
    tracklist: sortedSongs,
    updatedAt: "",
    gameTracks: [],
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
export function getExistingGameTrack(
  playlistObject: CustomPlaylistSchema,
  localDate: string
): GameTrackSchema | null {
  const filteredGameTracks = playlistObject.gameTracks.filter(
    (track) => track.date === localDate
  );
  return filteredGameTracks.length > 0 ? filteredGameTracks[0] : null;
}

/**
 * Selects a new game track
 *
 * @param playlistId the id of the playlist
 * @param playlistObject existing playlist game data
 * @param localDate the date of the track to choose for
 * @returns the selected game track
 */
export async function chooseNewGameTrack(
  playlistId: string,
  playlistObject: CustomPlaylistSchema,
  localDate: string
): Promise<GameTrackSchema> {
  let allTracksList: TrackSchema[] = playlistObject.tracklist;

  if (allTracksList.filter((song) => !song.playedBefore).length === 0) {
    allTracksList = resetTrackListPlayedBeforeStatus(allTracksList);
  }

  let randomTrackIndex: number, chosenTrack: TrackSchema;
  do {
    randomTrackIndex = Math.floor(Math.random() * allTracksList.length);
    chosenTrack = allTracksList[randomTrackIndex];
  } while (chosenTrack.playedBefore);

  const gameId =
    playlistObject.gameTracks.length > 0
      ? playlistObject.gameTracks[playlistObject.gameTracks.length - 1].id + 1
      : 1;

  const newGameTrack: GameTrackSchema = {
    albumCover: chosenTrack.albumCover,
    artists: chosenTrack.artists,
    date: localDate,
    externalUrl: chosenTrack.externalUrl,
    id: gameId,
    song: chosenTrack.song,
    stats: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    totalPlays: 0,
    trackPreview: chosenTrack.trackPreview,
  };

  playlistObject.updatedAt = DateTime.now()
    .setZone("America/New_York")
    .toFormat("yyyy-MM-dd HH:mm:ss");
  playlistObject.gameTracks.push(newGameTrack);
  allTracksList[randomTrackIndex].playedBefore = true;
  playlistObject.tracklist = allTracksList;
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
async function sortPlaylistResponse(
  response: SpotifyPlaylistObject,
  pastGameTracks?: GameTrackSchema[]
): Promise<TrackSchema[]> {
  return new Promise((resolve, _reject) => {
    const trackItems: PlaylistTrackObject[] = response.tracks.items;
    const sortedSongs: TrackSchema[] = [];

    trackItems.forEach(async (trackItem: PlaylistTrackObject) => {
      const track: TrackObject = trackItem.track;
      const title = track.name;
      const artists: string[] = [];
      track.artists.forEach((artist) => {
        artists.push(artist.name);
      });
      const externalUrl = track.external_urls.spotify;
      const trackPreview = track.preview_url;
      const albumCover = track.album.images[0].url;
      const spotifyUri = track.id;
      const playedBefore = checkIfInGameTracks(externalUrl, pastGameTracks);
      const document: TrackSchema = {
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
function checkIfInGameTracks(
  externalUrl: string,
  gameTracks: GameTrackSchema[]
) {
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
function resetTrackListPlayedBeforeStatus(
  trackList: TrackSchema[]
): TrackSchema[] {
  return trackList.map((track: TrackSchema) => ({
    ...track,
    playedBefore: false,
  }));
}
