import crypto from "crypto";
import db from "@/lib/firebase";
import { FirebaseMainPlaylist, MainGameSnapshot } from "@/types";
import { currentDateTimeString } from "@/utils/utils";

/**
 * Resets all of the tracks in the main game to unplayed.
 * If there is no snapshot, it does nothing.
 */
export const resetAllMainGameTracks = async () => {
  const playlistObject = await db.getLastDocument<MainGameSnapshot>("allTracks");
  if (!playlistObject) return;

  const oldSongs = playlistObject.data.tracklist;
  const oldSongsReset = oldSongs.map((song) => {
    return {
      ...song,
      playedBefore: false,
    };
  });

  const currentDateTime = currentDateTimeString();
  const songsToAdd = {
    tracklist: oldSongsReset,
    snapshotId: `snapshot-${crypto.randomBytes(4).toString("hex")}`,
    createdAt: currentDateTime,
    resetHistory: [], // resetHistory is not used in the main game
  };

  await db.createDocument<FirebaseMainPlaylist>("allTracks", currentDateTime, songsToAdd);
};
