import { DateTime } from "luxon";
import { HttpException } from "../utils/errors.utils";
import db from "../utils/firebase.utils";
import {
  tracksTransformer,
  gameTrackTransformer,
} from "../transformers/track.transformers";
import {
  FirebaseGameTrack,
  FirebaseMainPlaylist,
  FirebaseTrack,
  GameTrack,
  Track,
} from "../types";
import { resetAllMainGameTracks } from "../utils/main-game.utils";

export default class MainGameService {
  /**
   * Gets the daily song
   *
   * @param timeZone the user's time zone
   * @returns the daily song
   */
  static async getDailySong(localDate: string): Promise<GameTrack> {
    const dailyGameTrack: FirebaseGameTrack | null = await db.getDocument(
      "gameTracks",
      localDate
    );

    if (dailyGameTrack) {
      return {
        song: dailyGameTrack.song,
        artists: dailyGameTrack.artists,
        id: dailyGameTrack.id,
        trackPreview: dailyGameTrack.trackPreview,
        albumCover: dailyGameTrack.albumCover,
        externalUrl: dailyGameTrack.externalUrl,
      };
    }

    let mostRecentTracksSnapshot: { id: string; data: FirebaseMainPlaylist } =
      await db.getLastDocument("allTracks");
    let mostRecentTracksTracklist: FirebaseTrack[] =
      mostRecentTracksSnapshot.data.tracklist;

    // If all tracks have been played, reset all tracks
    let unplayedTracks = mostRecentTracksTracklist.filter(
      (track) => !track.playedBefore
    );
    if (unplayedTracks.length === 0) {
      await resetAllMainGameTracks();
      mostRecentTracksSnapshot = await db.getLastDocument("allTracks");
      mostRecentTracksTracklist = mostRecentTracksSnapshot.data.tracklist;
      unplayedTracks = mostRecentTracksSnapshot.data.tracklist;
    }

    // Choose a random track from the unplayed tracks
    const randomTrackIndex = Math.floor(Math.random() * unplayedTracks.length);
    const chosenTrack = unplayedTracks[randomTrackIndex];

    // Update the tracklist to mark the chosen track as played
    const chosenTrackIndex = mostRecentTracksTracklist.findIndex(
      (track) => track.trackPreview === chosenTrack.trackPreview
    );
    mostRecentTracksTracklist[chosenTrackIndex].playedBefore = true;

    const previousRecentGameTrack: { id: string; data: FirebaseGameTrack } =
      await db.getLastDocument("gameTracks");
    const gameId = previousRecentGameTrack
      ? previousRecentGameTrack.data.id + 1
      : 1;
    const date = DateTime.now()
      .setZone("America/New_York")
      .toFormat("yyyy-MM-dd HH:mm:ss");

    const newGameTrack: FirebaseGameTrack = {
      albumCover: chosenTrack.albumCover,
      artists: chosenTrack.artists,
      createdAt: date,
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
    };
    await db.updateDocument(
      "allTracks",
      mostRecentTracksSnapshot.id,
      updatedDoc
    );

    return gameTrackTransformer(newGameTrack);
  }

  /**
   * Gets all of the songs in the database
   *
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs(): Promise<Track[]> {
    const allTracks: { id: string; data: FirebaseMainPlaylist } =
      await db.getLastDocument("allTracks");

    if (!allTracks) return [];
    return tracksTransformer(allTracks.data.tracklist);
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
        localDate
      );
      if (todaysGameTrack) {
        todaysGameTrack.stats[score] = todaysGameTrack.stats[score] + 1;
        todaysGameTrack.totalPlays = todaysGameTrack.totalPlays + 1;
        await db.updateDocument("gameTracks", localDate, todaysGameTrack);
        return { success: true };
      } else throw Error();
    } catch (err) {
      throw new HttpException(400, "Failed to post stats");
    }
  }
}
