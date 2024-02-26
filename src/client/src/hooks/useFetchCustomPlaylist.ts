import { useEffect, useState } from "react";
import queryString from "query-string";

import TrackFormat from "../types/TrackFormat";

const useFetchCustomPlaylist = (apiOrigin: string, locationSearch: string) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
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
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryParams = queryString.parse(locationSearch);
    const playlistId = queryParams.playlist;

    if (playlistId) {
      setLoading(true);

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      fetch(
        `${apiOrigin}/api/playlist/${playlistId}/dailySong?timeZone=${timezone}${
          queryParams.r ? "&r=1" : ""
        }`,
        { method: "GET" }
      )
        .then(async (response) => {
          if (!response.ok) {
            return response.json().then((errorBody) => {
              setError(errorBody);
              throw new Error("Failed to fetch custom playlist");
            });
          }
          return response.json();
        })
        .then((data) => {
          if (!localStorage.getItem("userData")) {
            localStorage.setItem(
              "userData",
              JSON.stringify({ main: [], custom: {} })
            );
          }

          setData((prevState) => ({
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
          setData((prevState) => ({
            ...prevState,
            songsInDb: data.tracklist,
          }));
        })
        .catch((err) => {
          console.error(
            "Encountered the following error while fetching:",
            err.message
          );
        })
        .finally(() => setLoading(false));
    }
  }, [apiOrigin, locationSearch]);

  return { loading, data, error };
};

export default useFetchCustomPlaylist;
