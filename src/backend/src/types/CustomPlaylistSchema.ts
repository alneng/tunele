import GameTrackSchema from "./GameTrackSchema";
import MainPlaylistSchema from "./MainPlaylistSchema";

export default interface CustomPlaylistSchema extends MainPlaylistSchema {
  updatedAt: string;
  gameTracks: GameTrackSchema[];
}
