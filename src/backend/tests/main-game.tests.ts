import MainGameService from "../src/services/main-game.services";
import db from "../src/lib/firebase";
import { HttpException } from "../src/utils/errors.utils";
import {
  gameTrackDocumentExtras,
  NeverGonna,
  TalkThatTalk,
  allTracks,
} from "./test-data/songs.test-data";

jest.mock("../src/lib/firebase");

describe("Main Game Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("/dailySong endpoint", () => {
    test("getDailySong returns a song if one already exists", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue(NeverGonna);

      const dailySong = await MainGameService.getDailySong("2024-01-26");
      expect(dailySong).toEqual(NeverGonna);
    });

    test("getDailySong returns a new song if one doesn't exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue(null);
      jest.spyOn(db, "getLastDocument").mockResolvedValueOnce({
        id: "2024-01-26 23:27:00",
        data: allTracks,
      });
      jest
        .spyOn(db, "getLastDocument")
        .mockResolvedValueOnce({ id: "2024-01-26", data: NeverGonna });

      const dailySong = await MainGameService.getDailySong("2024-01-27");
      expect(dailySong).toEqual(TalkThatTalk);
    });
  });

  describe("/allSongs endpoint", () => {
    test("allSongs returns all songs in the main game tracklist", async () => {
      jest.spyOn(db, "getLastDocument").mockResolvedValue({
        id: "2024-01-26 23:27:00",
        data: allTracks,
      });

      const allSongs = await MainGameService.getAllSongs();
      expect(allSongs).toEqual(
        [NeverGonna, TalkThatTalk].map(({ song, artists }) => ({
          song,
          artists,
        }))
      );
    });
  });

  describe("/stats endpoint", () => {
    test("postStats adds stats data correctly to the game track", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...TalkThatTalk,
        ...gameTrackDocumentExtras,
      });

      const status = await MainGameService.postStats("2024-01-27", 1);
      expect(status).toEqual({ success: true });
    });

    test("postStats fails if a game track with that date does not exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue(null);

      await expect(MainGameService.postStats("2024-01-28", 1)).rejects.toThrow(
        new HttpException(400, "Failed to post stats")
      );
    });
  });
});
