import { useEffect, useState } from "react";

import TrackFormat from "../types/TrackFormat";

const useFetchMainPlaylist = (apiOrigin: string) => {
  const [playlistData, setPlaylistData] = useState<{
    song: string;
    artists: string[];
    id: number;
    trackPreview: string;
    albumCover: string;
    externalUrl: string;
    songsInDb: TrackFormat[];
  }>({
    song: "",
    artists: [],
    id: 0,
    trackPreview: "",
    albumCover: "",
    externalUrl: "",
    songsInDb: [],
  });

  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`${apiOrigin}/api/dailySong?timeZone=${timezone}`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (!localStorage.getItem("userData")) {
          localStorage.setItem(
            "userData",
            JSON.stringify({ main: [], custom: {} })
          );
        }

        setPlaylistData((prevState) => ({
          ...prevState,
          song: data.song,
          artists: data.artists,
          id: data.id,
          trackPreview: data.trackPreview,
          albumCover: data.albumCover,
          externalUrl: data.externalUrl,
        }));

        return fetch(`${apiOrigin}/api/allSongs`, { method: "GET" });
      })
      .then((response) => response.json())
      .then((data) => {
        setPlaylistData((prevState) => ({
          ...prevState,
          songsInDb: data.tracklist,
        }));
      })
      .catch((err) => console.error(err));
  }, [apiOrigin]);

  return playlistData;
};

export default useFetchMainPlaylist;
