import { DateTime } from "luxon";
import crypto from "crypto";
import db from "./firebase.utils";
import MainPlaylistSchema from "../types/MainPlaylistSchema";

/**
 * Resets all of the tracks in the main game to unplayed.
 */
export const resetAllMainGameTracks = async () => {
  const playlistObject: {
    id: string;
    data: MainPlaylistSchema;
  } = await db.getLastDocument("allTracks");

  const oldSongs = playlistObject.data.tracklist;
  const oldSongsReset = oldSongs.map((song) => {
    return {
      ...song,
      playedBefore: false,
    };
  });

  const currentDateTime = DateTime.now()
    .setZone("America/New_York")
    .toFormat("yyyy-MM-dd HH:mm:ss");
  const songsToAdd = {
    tracklist: oldSongsReset,
    snapshotId: `snapshot-${crypto.randomBytes(4).toString("hex")}`,
    createdAt: currentDateTime,
  };

  await db.createDocument("allTracks", currentDateTime, songsToAdd);
};
