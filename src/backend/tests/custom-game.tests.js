const CustomGameService = require("../src/services/custom-game.services");
const db = require("../src/utils/firebase.utils");
const { HttpException } = require("../src/utils/errors.utils");
const {
  gameTrackDocumentExtras,
  NeverGonna,
  TalkThatTalk,
  allTracks,
} = require("./test-data/songs.test-data");

jest.mock("../src/utils/firebase.utils");

describe("Custom Game Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("/dailySong endpoint", () => {
    test("getDailySong returns a song if one already exists", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [{ ...NeverGonna, ...gameTrackDocumentExtras }],
      });

      const dailySong = await CustomGameService.getDailySong(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-27",
        false
      );
      expect(dailySong).toEqual(NeverGonna);
    });

    test("getDailySong returns a new song if one doesn't exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [{ ...NeverGonna, ...gameTrackDocumentExtras }],
      });

      const dailySong = await CustomGameService.getDailySong(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-28",
        false
      );
      expect(dailySong).toEqual(TalkThatTalk);
    });
  });

  describe("/allSongs endpoint", () => {
    test("allSongs returns all songs in a custom game tracklist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [],
      });

      const allSongs = await CustomGameService.getAllSongs(
        "37i9dQZEVXbLp5XoPON0wI"
      );
      expect(allSongs).toEqual({
        tracklist: [NeverGonna, TalkThatTalk].map(({ song, artists }) => ({
          song,
          artists,
        })),
      });
    });
  });

  describe("/stats endpoint", () => {
    test("postStats adds stats data correctly to the game track", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [{ ...TalkThatTalk, ...gameTrackDocumentExtras }],
      });

      const status = await CustomGameService.postStats(
        "37i9dQZEVXbLp5XoPON0wI",
        "2024-01-27",
        1
      );
      expect(status).toEqual({ success: true });
    });

    test("postStats fails if there are no game tracks", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [],
      });

      await expect(
        CustomGameService.postStats("37i9dQZEVXbLp5XoPON0wI", "2024-01-27", 1)
      ).rejects.toThrow(new HttpException(400, { success: false }));
    });

    test("postStats fails if a game track with that date does not exist", async () => {
      jest.spyOn(db, "getDocument").mockResolvedValue({
        ...allTracks,
        updatedAt: "",
        gameTracks: [{ ...TalkThatTalk, ...gameTrackDocumentExtras }],
      });

      await expect(
        CustomGameService.postStats("37i9dQZEVXbLp5XoPON0wI", "2024-01-28", 1)
      ).rejects.toThrow(new HttpException(400, { success: false }));
    });
  });
});
