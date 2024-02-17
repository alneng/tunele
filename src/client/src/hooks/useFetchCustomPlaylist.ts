import { useEffect, useState } from "react";
import queryString from "query-string";

import TrackFormat from "../types/TrackFormat";

const useFetchCustomPlaylist = (apiOrigin: string, locationSearch: string) => {
  const [playlistData, setPlaylistData] = useState<{
    validPlaylist: boolean;
    playlistId: string;
    song: string;
    artists: string[];
    id: number;
    trackPreview: string;
    albumCover: string;
    externalUrl: string;
    songsInDb: TrackFormat[];
  }>({
    validPlaylist: false,
    playlistId: "",
    song: "",
    artists: [],
    id: 0,
    trackPreview: "",
    albumCover: "",
    externalUrl: "",
    songsInDb: [],
  });

  useEffect(() => {
    const queryParams = queryString.parse(locationSearch);
    const playlistId = queryParams.playlist;

    if (playlistId) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fetch(
        `${apiOrigin}/api/playlist/${playlistId}/dailySong?timeZone=${timezone}${
          queryParams.r ? "&r=1" : ""
        }`,
        { method: "GET" }
      )
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
            validPlaylist: true,
            playlistId: playlistId as string,
            song: data.song,
            artists: data.artists,
            id: data.id,
            trackPreview: data.trackPreview,
            albumCover: data.albumCover,
            externalUrl: data.externalUrl,
          }));

          return fetch(`${apiOrigin}/api/playlist/${playlistId}/allSongs`, {
            method: "GET",
          });
        })
        .then((response) => response.json())
        .then((data) => {
          setPlaylistData((prevState) => ({
            ...prevState,
            songsInDb: data.tracklist,
          }));
        })
        .catch((err) => console.error(err));
    }
  }, [apiOrigin, locationSearch]);

  return playlistData;
};

export default useFetchCustomPlaylist;
