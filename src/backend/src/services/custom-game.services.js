const { HttpException } = require("../utils/errors.utils");
const db = require("../utils/firebase.utils");
const {
  refreshPlaylist,
  getExistingGameTrack,
  chooseNewGameTrack,
} = require("../utils/custom-game.utils");

module.exports = class CustomGameService {
  /**
   * Gets the daily song
   *
   * @param playlistId the id of the custom playlist
   * @param timeZone the user's time zone
   * @param refreshFlag if playlist should be updated with new songs from Spotify api
   * @returns the daily song
   */
  static async getDailySong(playlistId, localDate, refreshFlag) {
    let playlistObject = await db.getDocument("customPlaylists", playlistId);

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
    return {
      song: newGameTrack.song,
      artists: newGameTrack.artists,
      id: newGameTrack.id,
      trackPreview: newGameTrack.trackPreview,
      albumCover: newGameTrack.albumCover,
      externalUrl: newGameTrack.externalUrl,
    };
  }

  /**
   * Gets all of the songs in the database
   *
   * @param playlistId the id of the custom playlist
   * @returns List of song objects {song: String, artists: String[]}
   */
  static async getAllSongs(playlistId) {
    const allTracks = await db.getDocument("customPlaylists", playlistId);
    const tracklist = allTracks.tracklist.map(({ song, artists }) => ({
      song,
      artists,
    }));
    return { tracklist };
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
  static async postStats(playlistId, localDate, score) {
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
          return { success: true };
        }
      }
      if (!foundTrack) throw Error();
    } catch (error) {
      throw new HttpException(400, { success: false });
    }
  }
};
