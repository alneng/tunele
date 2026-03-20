import MainGameService from "@/services/main-game.services";
import db from "@/lib/firebase";
import { HttpException } from "@/utils/errors.utils";
import {
  gameTrackDocumentExtras,
  NeverGonna,
  TalkThatTalk,
  allTracks,
} from "@test/test-data/songs.test-data";
import { RedisService } from "@/lib/redis.service";

jest.mock("@/lib/firebase");
jest.mock("@/lib/redis.service");

describe("Main Game Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("/dailySong endpoint", () => {
    test("getDailySong returns a song from Redis if it exists", async () => {
      jest.spyOn(RedisService, "getJSON").mockResolvedValue(NeverGonna);
      const getDocumentSpy = jest.spyOn(db, "getDocument");

      const dailySong = await MainGameService.getDailySong("2024-01-26");
      expect(dailySong).toEqual(NeverGonna);
      expect(getDocumentSpy).not.toHaveBeenCalled();
    });

    test("getDailySong returns a song from DB if not in Redis", async () => {
      jest.spyOn(RedisService, "getJSON").mockResolvedValue(null);
      jest.spyOn(db, "getDocument").mockResolvedValue(NeverGonna);
      const setJSONSpy = jest.spyOn(RedisService, "setJSON");

      const dailySong = await MainGameService.getDailySong("2024-01-26");
      expect(dailySong).toEqual(NeverGonna);
      expect(setJSONSpy).toHaveBeenCalledWith(
        expect.stringContaining("cache:main:game_track:2024-01-26"),
        NeverGonna,
        expect.any(Number),
      );
    });

    test("getDailySong returns a new song if one doesn't exist", async () => {
      jest.spyOn(RedisService, "getJSON").mockResolvedValue(null);
      jest.spyOn(db, "getDocument").mockResolvedValue(null);
      jest.spyOn(db, "getLastDocument").mockResolvedValueOnce({
        id: "2024-01-26 23:27:00",
        data: allTracks,
      });
      jest
        .spyOn(db, "getLastDocument")
        .mockResolvedValueOnce({ id: "2024-01-26", data: NeverGonna });
      const setJSONSpy = jest.spyOn(RedisService, "setJSON");

      const dailySong = await MainGameService.getDailySong("2024-01-27");
      expect(dailySong).toEqual(TalkThatTalk);
      expect(setJSONSpy).toHaveBeenCalledWith(
        expect.stringContaining("cache:main:game_track:2024-01-27"),
        expect.objectContaining({
          song: TalkThatTalk.song,
          artists: TalkThatTalk.artists,
        }),
        expect.any(Number),
      );
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
        })),
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
        new HttpException(400, "Failed to post stats"),
      );
    });
  });
});
