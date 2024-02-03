import GameResult from "./ClientGameResult";

export default interface SavedGameData {
  main: GameResult[];
  custom: { [playlistId: string]: GameResult[] };
}
