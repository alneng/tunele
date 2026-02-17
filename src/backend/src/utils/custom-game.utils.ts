import { randomBytes } from "crypto";
import db from "../lib/firebase";
import { fetchPlaylist } from "./spotify.utils";
import {
  SpotifyPlaylistObject,
  PlaylistTrackObject,
  TrackObject,
  FirebaseTrack,
  FirebaseCustomPlaylist,
  FirebaseGameTrack,
} from "../types";
import { EmptyPlaylistException, HttpException } from "./errors.utils";
import Logger from "../lib/logger";
import { currentDateTimeString } from "./utils";
import { getPreview } from "spotify-audio-previews";
import { DateTime } from "luxon";

/**
 * Generates or refreshes a custom game playlist object
 *
 * @param playlistId the id of the playlist
 * @param playlist existing playlist game data, if any
 * @param refreshFlag if playlist should be updated with new songs from Spotify api
 * @returns a custom game playlist object
 */
export async function refreshPlaylist(
  playlistId: string,
  playlist: FirebaseCustomPlaylist | null,
  refreshFlag: boolean,
): Promise<FirebaseCustomPlaylist> {
  const response = await fetchPlaylist(playlistId, { fetchAllTracks: true });
  const sortedSongs = sortPlaylistResponse(response, playlist);

  const now = currentDateTimeString();

  const updatedPlaylist: FirebaseCustomPlaylist = {
    createdAt: playlist?.createdAt || now,
    snapshotId: `snapshot-${randomBytes(4).toString("hex")}`,
    spotifySnapshotId: response.snapshot_id,
    tracklist: sortedSongs,
    updatedAt: now,
    gameTracks: playlist?.gameTracks || [],
    resetHistory: playlist?.resetHistory || [],
  };

  if (refreshFlag && playlist) {
    // Update an existing playlist
    return await db.updateDocument<FirebaseCustomPlaylist>(
      "customPlaylists",
      playlistId,
      updatedPlaylist,
    );
  } else {
    // Create a new playlist
    return await db.createDocument<FirebaseCustomPlaylist>(
      "customPlaylists",
      playlistId,
      updatedPlaylist,
    );
  }
}

/**
 * Gets an existing game track
 *
 * @param playlist existing playlist game data
 * @param localDate the date of the track to get
 * @returns an existing game track, or null if it does not exist
 */
export function getExistingGameTrack(
  playlist: FirebaseCustomPlaylist,
  localDate: string,
): FirebaseGameTrack | null {
  const tracks = playlist.gameTracks.filter(
    (track) => track.date === localDate,
  );
  return tracks.length > 0 ? tracks[0] : null;
}

/**
 * Selects a new game track.
 *
 * @param playlistId the id of the playlist
 * @param playlist existing playlist game data
 * @param localDate the date of the track to choose for
 * @returns the selected game track
 */
export async function chooseNewGameTrack(
  playlistId: string,
  playlist: FirebaseCustomPlaylist,
  localDate: string,
): Promise<FirebaseGameTrack> {
  try {
    let allTracksList = playlist.tracklist;
    if (!allTracksList || allTracksList.length === 0) {
      throw new EmptyPlaylistException();
    }

    // Reset played status if all tracks have been played
    if (
      !allTracksList.some((song) => !song.playedBefore && !song.nullPreview)
    ) {
      allTracksList = resetTrackListPlayedBeforeStatus(allTracksList);
      playlist.resetHistory.unshift({
        resetAt: localDate,
        spotifySnapshotId: playlist.spotifySnapshotId,
      });
    }

    // Filter eligible tracks (unplayed tracks without nullPreview flag)
    const eligibleTracks = allTracksList
      .map((track, index) => ({ track, index }))
      .filter((item) => !item.track.playedBefore && !item.track.nullPreview);

    if (eligibleTracks.length === 0) {
      throw new EmptyPlaylistException();
    }

    // Select a random track from eligible tracks
    const randomSelection = Math.floor(Math.random() * eligibleTracks.length);
    const { track, index } = eligibleTracks[randomSelection];

    // If track already has a preview, use it
    if (track.trackPreview) {
      return createAndSaveGameTrack(
        track,
        index,
        playlistId,
        playlist,
        allTracksList,
        localDate,
      );
    }
    // Otherwise, try to get the preview
    const trackPreview = await getPreview(track.spotifyUri);

    // If preview retrieval fails, mark track as nullPreview and try again recursively
    if (!trackPreview) {
      allTracksList[index].nullPreview = true;
      playlist.tracklist = allTracksList;
      const updatedPlaylist = await db.updateDocument(
        "customPlaylists",
        playlistId,
        playlist,
      );
      return chooseNewGameTrack(playlistId, updatedPlaylist, localDate);
    }
    // If preview retrieval succeeds, save the preview to the track
    allTracksList[index].trackPreview = trackPreview;

    return createAndSaveGameTrack(
      track,
      index,
      playlistId,
      playlist,
      allTracksList,
      localDate,
    );
  } catch (error) {
    Logger.error("Failed to choose new game track", {
      error,
      method: chooseNewGameTrack.name,
      data: { playlistId, playlist, localDate },
    });
    throw new HttpException(500, "Failed to choose new game track");
  }
}

/**
 * Creates a new game track and saves it to the database.
 *
 * @param track the selected game track
 * @param index the index of the track in the track list
 * @param playlistId the id of the playlist
 * @param playlist the existing playlist object
 * @param allTracksList the list of all tracks in the playlist
 * @param localDate the date of the game track
 * @returns the created game track
 */
async function createAndSaveGameTrack(
  track: FirebaseTrack,
  index: number,
  playlistId: string,
  playlist: FirebaseCustomPlaylist,
  allTracksList: FirebaseTrack[],
  localDate: string,
): Promise<FirebaseGameTrack> {
  const gameNumber = playlist.gameTracks.length;
  const newGameTrack: FirebaseGameTrack = {
    albumCover: track.albumCover,
    artists: track.artists,
    date: localDate,
    externalUrl: track.externalUrl,
    id: gameNumber > 0 ? playlist.gameTracks[gameNumber - 1].id + 1 : 1,
    song: track.song,
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
    trackPreview: track.trackPreview,
  };

  // Update the playlist object with the new game track
  playlist.updatedAt = currentDateTimeString();
  playlist.gameTracks.push(newGameTrack);
  allTracksList[index].playedBefore = true; // Mark the track as played
  playlist.tracklist = allTracksList;

  // Save the updated playlist object to the database
  await db.updateDocument<FirebaseCustomPlaylist>(
    "customPlaylists",
    playlistId,
    playlist,
  );
  return newGameTrack;
}

/**
 * Merges all songs of a Spotify playlist response with the existing game tracks of a custom game.
 *
 * Accounts for whether game tracks have been already played before. Whether a track has
 * been played before is determined by whether the track has been in the game tracks in the
 * current "reset history window".
 *
 * @param response songs from a Spotify playlist, in Spotify object track format
 * @param playlist existing playlist data
 * @returns a list of tracks for the playlist
 */
function sortPlaylistResponse(
  response: SpotifyPlaylistObject,
  playlist: FirebaseCustomPlaylist | null,
): FirebaseTrack[] {
  const tracklist = playlist?.tracklist || [];
  const pastGameTracks = playlist?.gameTracks || [];
  const resetHistory = playlist?.resetHistory || [];

  try {
    const trackItems: PlaylistTrackObject[] = response.tracks.items;

    if (trackItems.length === 0) {
      throw new EmptyPlaylistException();
    }

    // Pre-process past tracks and game tracks into a map
    const pastTracksMap = new Map<string, FirebaseTrack>();
    tracklist.forEach((track) => {
      pastTracksMap.set(track.externalUrl, track);
    });
    const gameTracksMap = new Map<string, FirebaseGameTrack[]>();
    pastGameTracks.forEach((track) => {
      if (!gameTracksMap.has(track.externalUrl)) {
        gameTracksMap.set(track.externalUrl, []);
      }
      gameTracksMap.get(track.externalUrl)!.push(track);
    });

    const recentResetDate =
      resetHistory.length > 0
        ? DateTime.fromFormat(resetHistory[0].resetAt, "yyyy-MM-dd")
        : null;

    const result: FirebaseTrack[] = [];
    for (const item of trackItems) {
      const track: TrackObject = item.track;
      if (!track || track.is_local) continue; // Skip local tracks

      const externalUrl = track.external_urls.spotify;
      const trackData = pastTracksMap.get(externalUrl);
      const gameTracks = gameTracksMap.get(externalUrl) || [];
      const playedBefore = recentResetDate
        ? gameTracks.some(
            (t) => DateTime.fromFormat(t.date, "yyyy-MM-dd") >= recentResetDate,
          )
        : gameTracks.length > 0;

      result.push({
        song: track.name,
        artists: track.artists.map((artist) => artist.name),
        spotifyUri: track.id,
        trackPreview: trackData?.trackPreview || track.preview_url || null,
        albumCover: track.album.images[0]?.url || "/album-placeholder.svg",
        externalUrl,
        playedBefore,
        nullPreview: trackData?.nullPreview,
      });
    }

    return result;
  } catch (error) {
    Logger.error("Failed to sort playlist response", {
      error,
      method: sortPlaylistResponse.name,
      data: { response, pastGameTracks },
    });
    throw new HttpException(500, "Failed to sort playlist response");
  }
}

/**
 * Resets the playedBefore status of all tracks in the track list.
 * Warning: This action is irreversible
 *
 * @param trackList the track list to reset the status of
 * @returns the new track list of reset statuses
 */
function resetTrackListPlayedBeforeStatus(
  trackList: FirebaseTrack[],
): FirebaseTrack[] {
  return trackList.map((track: FirebaseTrack) => ({
    ...track,
    playedBefore: false,
  }));
}
