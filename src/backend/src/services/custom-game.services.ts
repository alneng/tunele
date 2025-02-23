import { HttpException } from "../utils/errors.utils";
import db from "../utils/firebase.utils";
import {
  refreshPlaylist,
  getExistingGameTrack,
  chooseNewGameTrack,
} from "../utils/custom-game.utils";
import {
  tracksTransformer,
  gameTrackTransformer,
} from "../transformers/track.transformers";
import { FirebaseCustomPlaylist, GameTrack, Track } from "../types";
import { log } from "../utils/logger.utils";

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
    refreshFlag: boolean
  ): Promise<GameTrack> {
    let playlistObject: FirebaseCustomPlaylist | null = await db.getDocument(
      "customPlaylists",
      playlistId
    );

    if (!playlistObject || refreshFlag) {
      playlistObject = await refreshPlaylist(
        playlistId,
        playlistObject,
        refreshFlag
      );
    }

    const selectedGameTrack = getExistingGameTrack(playlistObject, localDate);

    if (selectedGameTrack) {
      return {
        song: selectedGameTrack.song,
        artists: selectedGameTrack.artists,
        id: selectedGameTrack.id,
        trackPreview: selectedGameTrack.trackPreview,
        albumCover: selectedGameTrack.albumCover,
        externalUrl: selectedGameTrack.externalUrl,
      };
    }

    const newGameTrack = await chooseNewGameTrack(
      playlistId,
      playlistObject,
      localDate
    );

    return gameTrackTransformer(newGameTrack);
  }

  /**
   * Gets all of the songs in the database
   *
   * @param playlistId the id of the custom playlist
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs(playlistId: string): Promise<Track[]> {
    const allTracks: FirebaseCustomPlaylist | null = await db.getDocument(
      "customPlaylists",
      playlistId
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
      playlistId
    );
    if (!playlistObject) throw Error();

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
            playlistObject
          );
          return { success: true };
        }
      }
      if (!foundTrack) throw Error();
    } catch (error) {
      log.error("Failed to post stats", {
        meta: {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          method: CustomGameService.postStats.name,
          data: { playlistId, localDate, score, playlistObject },
        },
      });
      throw new HttpException(400, "Failed to post stats");
    }
  }
}
