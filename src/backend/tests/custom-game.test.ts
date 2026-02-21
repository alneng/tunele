import CustomGameService from "@/services/custom-game.services";
import db from "@/lib/firebase";
import { HttpException } from "@/utils/errors.utils";
import {
  gameTrackDocumentExtras,
  NeverGonna,
  TalkThatTalk,
  allTracks,
} from "@test/test-data/songs.test-data";
import * as spotifyUtils from "@/utils/spotify.utils";
import { mockSpotifyPlaylist } from "@test/test-data/spotify.test-data";
import { RedisService } from "@/lib/redis.service";

jest.mock("@/lib/redis.service");
jest.mock("@/lib/firebase");
jest.mock("@/utils/spotify.utils");

describe("Custom Game Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("/dailySong endpoint", () => {
    test("getDailySong returns a song if one already exists", async () => {
      jest.spyOn(RedisService, "getJSON").mockResolvedValue(null);
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        gameTracks: [{ ...NeverGonna, ...gameTrackDocumentExtras }],
      });
      jest.spyOn(spotifyUtils, "fetchPlaylist").mockResolvedValue(mockSpotifyPlaylist);

      const dailySong = await CustomGameService.getDailySong(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-27",
        false,
      );
      expect(dailySong).toEqual(NeverGonna);
    });

    test("getDailySong returns a new song if one doesn't exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        gameTracks: [{ ...NeverGonna, ...gameTrackDocumentExtras }],
      });
      jest.spyOn(spotifyUtils, "fetchPlaylist").mockResolvedValue(mockSpotifyPlaylist);

      const dailySong = await CustomGameService.getDailySong(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-28",
        false,
      );
      expect(dailySong).toEqual(TalkThatTalk);
    });

    test("getDailySong resets track list playedBefore status and returns a new song if all songs have been played before", async () => {
      const singleTrackPlaylist = structuredClone(allTracks);
      singleTrackPlaylist.tracklist.pop();
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...singleTrackPlaylist,
        gameTracks: [{ ...NeverGonna, ...gameTrackDocumentExtras }],
      });
      jest.spyOn(spotifyUtils, "fetchPlaylist").mockResolvedValue(mockSpotifyPlaylist);

      const dailySong = await CustomGameService.getDailySong(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-28",
        false,
      );
      expect(dailySong).toEqual({ ...NeverGonna, id: 2 });
    });
  });

  describe("/allSongs endpoint", () => {
    test("allSongs returns all songs in a custom game tracklist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        gameTracks: [],
      });

      const allSongs = await CustomGameService.getAllSongs("37i9dQZEVXbLp5XoPON0wI");
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
        ...allTracks,
        gameTracks: [{ ...TalkThatTalk, ...gameTrackDocumentExtras }],
      });

      const status = await CustomGameService.postStats("37i9dQZEVXbLp5XoPON0wI", "2024-01-27", 1);
      expect(status).toEqual({ success: true });
    });

    test("postStats fails if there are no game tracks", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
      });

      await expect(
        CustomGameService.postStats("37i9dQZEVXbLp5XoPON0wI", "2024-01-27", 1),
      ).rejects.toThrow(new HttpException(400, "Failed to post stats"));
    });

    test("postStats fails if a game track with that date does not exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        gameTracks: [{ ...TalkThatTalk, ...gameTrackDocumentExtras }],
      });

      await expect(
        CustomGameService.postStats("37i9dQZEVXbLp5XoPON0wI", "2024-01-28", 1),
      ).rejects.toThrow(new HttpException(400, "Failed to post stats"));
    });
  });
});
