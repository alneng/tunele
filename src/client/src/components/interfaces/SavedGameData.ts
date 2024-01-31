import GameResult from "./GameResult";

export default interface SavedGameData {
  main: GameResult[];
  custom: { [playlistId: string]: GameResult[] };
}
