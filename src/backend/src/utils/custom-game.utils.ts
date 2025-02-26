import { randomBytes } from "crypto";
import { DateTime } from "luxon";
import db from "./firebase.utils";
import { fetchSongsFromPlaylist } from "./spotify.utils";
import {
  SpotifyPlaylistObject,
  PlaylistTrackObject,
  TrackObject,
  FirebaseTrack,
  FirebaseCustomPlaylist,
  FirebaseGameTrack,
} from "../types";
import { EmptyPlaylistException, HttpException } from "./errors.utils";
import { log } from "./logger.utils";

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
  playlistObject: FirebaseCustomPlaylist | null,
  refreshFlag: boolean
): Promise<FirebaseCustomPlaylist> {
  const response = await fetchSongsFromPlaylist(playlistId);
  const sortedSongs: FirebaseTrack[] =
    refreshFlag && playlistObject
      ? await sortPlaylistResponse(response, playlistObject.gameTracks)
      : await sortPlaylistResponse(response);

  const updatedPlaylistObject: FirebaseCustomPlaylist = {
    createdAt: DateTime.now()
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss"),
    snapshotId: `snapshot-${randomBytes(4).toString("hex")}`,
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

  return (await db.getDocument(
    "customPlaylists",
    playlistId
  )) as FirebaseCustomPlaylist;
}

/**
 * Gets an existing game track
 *
 * @param playlistObject existing playlist game data
 * @param localDate the date of the track to get
 * @returns an existing game track, or null if it does not exist
 */
export function getExistingGameTrack(
  playlistObject: FirebaseCustomPlaylist,
  localDate: string
): FirebaseGameTrack | null {
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
  playlistObject: FirebaseCustomPlaylist,
  localDate: string
): Promise<FirebaseGameTrack> {
  try {
    let allTracksList: FirebaseTrack[] = playlistObject.tracklist;
    if (!allTracksList || allTracksList.length === 0) {
      throw new EmptyPlaylistException();
    }

    if (allTracksList.filter((song) => !song.playedBefore).length === 0) {
      allTracksList = resetTrackListPlayedBeforeStatus(allTracksList);
    }

    let randomTrackIndex: number, chosenTrack: FirebaseTrack;
    do {
      randomTrackIndex = Math.floor(Math.random() * allTracksList.length);
      chosenTrack = allTracksList[randomTrackIndex];
    } while (chosenTrack.playedBefore);

    const gameId =
      playlistObject.gameTracks.length > 0
        ? playlistObject.gameTracks[playlistObject.gameTracks.length - 1].id + 1
        : 1;

    const newGameTrack: FirebaseGameTrack = {
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
  } catch (error) {
    log.error("Failed to choose new game track", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: chooseNewGameTrack.name,
        data: { playlistId, playlistObject, localDate },
      },
    });
    throw new HttpException(500, "Failed to choose new game track");
  }
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
  pastGameTracks: FirebaseGameTrack[] = []
): Promise<FirebaseTrack[]> {
  try {
    return new Promise((resolve, _reject) => {
      const trackItems: PlaylistTrackObject[] = response.tracks.items;
      const sortedSongs: FirebaseTrack[] = [];

      if (trackItems.length === 0) {
        throw new EmptyPlaylistException();
      }

      trackItems.forEach(async (trackItem: PlaylistTrackObject) => {
        const track: TrackObject = trackItem.track;
        const title = track.name;
        const artists: string[] = [];
        track.artists.forEach((artist) => {
          artists.push(artist.name);
        });
        const externalUrl = track.external_urls.spotify;
        const trackPreview = track.preview_url;
        const albumCover =
          track.album.images[0]?.url || "/album-placeholder.svg";
        const spotifyUri = track.id;
        const playedBefore = checkIfInGameTracks(externalUrl, pastGameTracks);
        const document: FirebaseTrack = {
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
  } catch (error) {
    log.error("Failed to sort playlist response", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: sortPlaylistResponse.name,
        data: { response, pastGameTracks },
      },
    });
    throw new HttpException(500, "Failed to sort playlist response");
  }
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
  gameTracks: FirebaseGameTrack[]
) {
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
  trackList: FirebaseTrack[]
): FirebaseTrack[] {
  return trackList.map((track: FirebaseTrack) => ({
    ...track,
    playedBefore: false,
  }));
}
