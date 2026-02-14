import { HttpException } from "../utils/errors.utils";
import db from "../lib/firebase";
import {
  tracksTransformer,
  gameTrackTransformer,
} from "../transformers/track.transformers";
import {
  FirebaseGameTrack,
  FirebaseMainPlaylist,
  FirebaseTrack,
  GameTrack,
  MainGameSnapshot,
  Track,
} from "../types";
import { resetAllMainGameTracks } from "../utils/main-game.utils";
import { log } from "../utils/logger.utils";
import { currentDateTimeString } from "../utils/utils";
import { RedisService } from "../lib/redis.service";
import { CacheKeys } from "../utils/redis.utils";

export default class MainGameService {
  /**
   * Gets the daily song
   *
   * @param timeZone the user's time zone
   * @returns the daily song
   */
  static async getDailySong(localDate: string): Promise<GameTrack> {
    // Check if the track is cached in Redis
    const track = await RedisService.getJSON<FirebaseGameTrack>(
      CacheKeys.MAIN_GAME_TRACK(localDate),
    );
    if (track) return gameTrackTransformer(track);

    const dailyGameTrack: FirebaseGameTrack | null = await db.getDocument(
      "gameTracks",
      localDate,
    );
    if (dailyGameTrack) {
      await RedisService.setJSON<FirebaseGameTrack>(
        CacheKeys.MAIN_GAME_TRACK(localDate),
        dailyGameTrack,
        24 * 60 * 60, // Cache for 24 hours
      );
      return gameTrackTransformer(dailyGameTrack);
    }

    let mostRecentTracksSnapshot: MainGameSnapshot | null =
      await db.getLastDocument("allTracks");

    if (!mostRecentTracksSnapshot) {
      log.info("Could not find a game snapshot", {
        meta: {
          detail:
            "mostRecentTracksSnapshot is null. Has the database been seeded?",
          method: MainGameService.getDailySong.name,
          data: { localDate },
        },
      });
      throw new HttpException(404, "Could not find a game snapshot");
    }

    let mostRecentTracksTracklist: FirebaseTrack[] =
      mostRecentTracksSnapshot.data.tracklist;

    // If all tracks have been played, reset all tracks
    let unplayedTracks = mostRecentTracksTracklist.filter(
      (track) => !track.playedBefore,
    );
    if (unplayedTracks.length === 0) {
      await resetAllMainGameTracks();
      mostRecentTracksSnapshot = (await db.getLastDocument(
        "allTracks",
      )) as MainGameSnapshot;
      mostRecentTracksTracklist = mostRecentTracksSnapshot.data.tracklist;
      unplayedTracks = mostRecentTracksSnapshot.data.tracklist;
    }

    // Choose a random track from the unplayed tracks
    const randomTrackIndex = Math.floor(Math.random() * unplayedTracks.length);
    const chosenTrack = unplayedTracks[randomTrackIndex];

    // Update the tracklist to mark the chosen track as played
    const chosenTrackIndex = mostRecentTracksTracklist.findIndex(
      (track) => track.trackPreview === chosenTrack.trackPreview,
    );
    mostRecentTracksTracklist[chosenTrackIndex].playedBefore = true;

    const previousRecentGameTrack: {
      id: string;
      data: FirebaseGameTrack;
    } | null = await db.getLastDocument("gameTracks");
    const gameId = previousRecentGameTrack
      ? previousRecentGameTrack.data.id + 1
      : 1;

    const newGameTrack: FirebaseGameTrack = {
      albumCover: chosenTrack.albumCover,
      artists: chosenTrack.artists,
      createdAt: currentDateTimeString(),
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
    await db.createDocument("gameTracks", localDate, newGameTrack);

    const updatedDoc: FirebaseMainPlaylist = {
      createdAt: mostRecentTracksSnapshot.id,
      snapshotId: mostRecentTracksSnapshot.data.snapshotId,
      tracklist: mostRecentTracksTracklist,
      resetHistory: [], // resetHistory is not used in the main game
    };
    await db.updateDocument(
      "allTracks",
      mostRecentTracksSnapshot.id,
      updatedDoc,
    );

    // Cache the new game track in Redis
    await RedisService.setJSON<FirebaseGameTrack>(
      CacheKeys.MAIN_GAME_TRACK(localDate),
      newGameTrack,
      24 * 60 * 60, // Cache for 24 hours
    );

    return gameTrackTransformer(newGameTrack);
  }

  /**
   * Gets all of the songs in the database
   *
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs(): Promise<Track[]> {
    const snapshot: MainGameSnapshot | null =
      await db.getLastDocument("allTracks");

    if (!snapshot) {
      log.info("Could not find a game snapshot", {
        meta: {
          detail: "snapshot is null. Has the database been seeded?",
          method: MainGameService.getDailySong.name,
        },
      });
      return [];
    }
    return tracksTransformer(snapshot.data.tracklist);
  }

  /**
   * Post game stats to database
   *
   * @param timeZone the user's time zone
   * @param score the user's score
   * @throws HttpException if stats update fails
   * @returns status of post
   */
  static async postStats(localDate: string, score: number) {
    try {
      const todaysGameTrack: FirebaseGameTrack | null = await db.getDocument(
        "gameTracks",
        localDate,
      );
      if (todaysGameTrack) {
        todaysGameTrack.stats[score] = todaysGameTrack.stats[score] + 1;
        todaysGameTrack.totalPlays = todaysGameTrack.totalPlays + 1;
        await db.updateDocument("gameTracks", localDate, todaysGameTrack);
        return { success: true };
      } else throw Error();
    } catch (error) {
      log.error("Failed to post stats", {
        meta: {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          method: MainGameService.postStats.name,
          data: { localDate, score },
        },
      });
      throw new HttpException(400, "Failed to post stats");
    }
  }
}
