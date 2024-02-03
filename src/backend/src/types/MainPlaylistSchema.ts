import TrackSchema from "./TrackSchema";

export default interface MainPlaylistSchema {
  createdAt: string;
  snapshotId: string;
  tracklist: TrackSchema[];
}
