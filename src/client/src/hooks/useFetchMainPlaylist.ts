import { useEffect, useState } from "react";

import TrackFormat from "../types/TrackFormat";

const useFetchMainPlaylist = (apiOrigin: string) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
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
  const [error, setError] = useState(null);

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

        setData((prevState) => ({
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
      .then(async (response) => {
        console.log(response);
        if (!response.ok) {
          return response.json().then((errorBody) => {
            setError(errorBody);
            throw new Error("Failed to fetch main playlist");
          });
        }
        return response.json();
      })
      .then((data) => {
        setData((prevState) => ({
          ...prevState,
          songsInDb: data.tracklist,
        }));
      })
      .catch((err) => {
        if (!error) setError(err.message);
        console.error(
          "Encountered the following error while fetching:",
          err.message
        );
      })
      .finally(() => setLoading(false));
  }, [apiOrigin, error]);

  return { loading, data, error };
};

export default useFetchMainPlaylist;
