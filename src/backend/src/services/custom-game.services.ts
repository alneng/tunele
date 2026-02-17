import { HttpException } from "../utils/errors.utils";
import db from "../lib/firebase";
import {
  refreshPlaylist,
  getExistingGameTrack,
  chooseNewGameTrack,
} from "../utils/custom-game.utils";
import {
  tracksTransformer,
  gameTrackTransformer,
} from "../transformers/track.transformers";
import {
  FirebaseCustomPlaylist,
  FirebaseGameTrack,
  GameTrack,
  Track,
} from "../types";
import Logger from "../lib/logger";
import { fetchPlaylist } from "../utils/spotify.utils";
import { RedisService } from "../lib/redis.service";
import { CacheKeys } from "../utils/redis.utils";

export default class CustomGameService {
  /**
   * Gets the daily song
   *
   * @param playlistId the id of the custom playlist
   * @param timeZone the user's time zone
   * @param refreshFlag if playlist should be updated with new songs from Spotify api
   * @returns the daily song
   */
  static async getDailySong(
    playlistId: string,
    localDate: string,
    refreshFlag: boolean,
  ): Promise<GameTrack> {
    // Check if the track is cached in Redis
    const track = await RedisService.getJSON<FirebaseGameTrack>(
      CacheKeys.PLAYLIST_GAME_TRACK(playlistId, localDate),
    );
    if (track) return gameTrackTransformer(track);

    // If not cached, fetch the playlist
    const spotifyPlaylist = await fetchPlaylist(playlistId);
    let playlist = await db.getDocument<FirebaseCustomPlaylist>(
      "customPlaylists",
      playlistId,
    );

    // If the playlist does not exist or needs to be refreshed, refresh it
    if (
      !playlist ||
      refreshFlag ||
      spotifyPlaylist.snapshot_id !== playlist.spotifySnapshotId
    ) {
      playlist = await refreshPlaylist(playlistId, playlist, refreshFlag);
    }

    // If the playlist already has a game track for the local date, return it
    const gameTrack = getExistingGameTrack(playlist, localDate);
    if (gameTrack) {
      // Cache the new game track in Redis
      await RedisService.setJSON<FirebaseGameTrack>(
        CacheKeys.PLAYLIST_GAME_TRACK(playlistId, localDate),
        gameTrack,
        24 * 60 * 60, // Cache for 24 hours
      );
      return gameTrackTransformer(gameTrack);
    }

    // If no existing game track, choose a new one
    const newGameTrack = await chooseNewGameTrack(
      playlistId,
      playlist,
      localDate,
    );

    // Cache the new game track in Redis
    await RedisService.setJSON<FirebaseGameTrack>(
      CacheKeys.PLAYLIST_GAME_TRACK(playlistId, localDate),
      newGameTrack,
      24 * 60 * 60, // Cache for 24 hours
    );

    // Return the new game track
    return gameTrackTransformer(newGameTrack);
  }

  /**
   * Gets all of the songs in the database
   *
   * @param playlistId the id of the custom playlist
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs(playlistId: string): Promise<Track[]> {
    const allTracks = await db.getDocument<FirebaseCustomPlaylist>(
      "customPlaylists",
      playlistId,
    );

    if (!allTracks) return [];
    return tracksTransformer(allTracks.tracklist);
  }

  /**
   * Post game stats to database
   *
   * @param playlistId the id of the custom playlist
   * @param timeZone the user's time zone
   * @param score the user's score
   * @throws HttpException if stats update fails
   * @returns status of post
   */
  static async postStats(playlistId: string, localDate: string, score: number) {
    const playlistObject: FirebaseCustomPlaylist | null = await db.getDocument(
      "customPlaylists",
      playlistId,
    );
    if (!playlistObject) throw Error("Playlist not found");

    try {
      let foundTrack = false;
      for (const track of playlistObject.gameTracks) {
        if (track.date === localDate) {
          track.totalPlays = track.totalPlays + 1;
          track.stats[score] = track.stats[score] + 1;

          foundTrack = true;
          await db.updateDocument(
            "customPlaylists",
            playlistId,
            playlistObject,
          );
          return { success: true };
        }
      }
      if (!foundTrack) throw Error();
    } catch (error) {
      Logger.error("Failed to post stats", {
        error,
        method: CustomGameService.postStats.name,
        data: { playlistId, localDate, score, playlistObject },
      });
      throw new HttpException(400, "Failed to post stats");
    }
  }
}
