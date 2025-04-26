import { SpotifyPlaylistObject } from "../../src/types";

export const mockSpotifyPlaylist: SpotifyPlaylistObject = {
  collaborative: false,
  description: "",
  external_urls: {
    spotify: "",
  },
  followers: {
    href: "",
    total: 0,
  },
  href: "",
  id: "",
  images: [
    {
      url: "",
      height: 0,
      width: 0,
    },
  ],
  name: "",
  owner: {
    external_urls: {
      spotify: "",
    },
    followers: {
      href: "",
      total: 0,
    },
    href: "",
    id: "",
    type: "",
    uri: "",
    display_name: "",
  },
  public: true,
  snapshot_id: "1234567890",
  tracks: {
    href: "",
    limit: 0,
    next: null,
    offset: 0,
    previous: null,
    total: 0,
    items: [],
    type: "",
    uri: "",
  },
};
