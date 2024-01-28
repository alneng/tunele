const { DateTime } = require("luxon");
const { HttpException } = require("../utils/errors.utils");
const db = require("../utils/firebase.utils");

module.exports = class MainGameService {
  /**
   * Gets the daily song
   *
   * @param timeZone the user's time zone
   * @returns the daily song
   */
  static async getDailySong(localDate) {
    const dailyGameTrack = await db.getDocument("gameTracks", localDate);

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

    const mostRecentTracksSnapshot = await db.getLastDocument("allTracks");
    const mostRecentTracksTracklist = mostRecentTracksSnapshot.data.tracklist;

    let randomTrackIndex, chosenTrack;
    do {
      randomTrackIndex = Math.floor(
        Math.random() * mostRecentTracksTracklist.length
      );
      chosenTrack = mostRecentTracksTracklist[randomTrackIndex];
    } while (chosenTrack.playedBefore);

    const previousRecentGameTrack = await db.getLastDocument("gameTracks");
    const gameId = previousRecentGameTrack
      ? previousRecentGameTrack.data.id + 1
      : 1;
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

    return {
      song: chosenTrack.song,
      artists: chosenTrack.artists,
      id: gameId,
      trackPreview: chosenTrack.trackPreview,
      albumCover: chosenTrack.albumCover,
      externalUrl: chosenTrack.externalUrl,
    };
  }

  /**
   * Gets all of the songs in the database
   *
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs() {
    const allTracks = await db.getLastDocument("allTracks");
    const tracklist = allTracks.data.tracklist.map(({ song, artists }) => ({
      song,
      artists,
    }));
    return { tracklist };
  }

  /**
   * Post game stats to database
   *
   * @param timeZone the user's time zone
   * @param score the user's score
   * @throws HttpException if stats update fails
   * @returns status of post
   */
  static async postStats(localDate, score) {
    try {
      const todaysGameTrack = await db.getDocument("gameTracks", localDate);
      if (todaysGameTrack) {
        todaysGameTrack.stats[score] = todaysGameTrack.stats[score] + 1;
        todaysGameTrack.totalPlays = todaysGameTrack.totalPlays + 1;
        await db.updateDocument("gameTracks", localDate, todaysGameTrack);
        return { success: true };
      } else throw Error();
    } catch (err) {
      throw new HttpException(400, { success: false });
    }
  }
};
