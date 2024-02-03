import axios from "axios";
import querystring from "querystring";

import {
  SpotifyPlaylistObject,
  PlaylistTrackObject,
} from "../types/spotify-types";

/**
 * Produces a Spotify access token
 *
 * @returns a Spotify access token
 */
async function fetchAccessToken(): Promise<string> {
  const data = {
    grant_type: "client_credentials",
  };
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.SPOTIFY_CLIENT_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: querystring.stringify(data),
    url: "https://accounts.spotify.com/api/token",
  };
  const response = await axios(options);
  return response.data.access_token;
}

/**
 * Fetches all of the songs in a Spotify playlist
 *
 * @param playlistId the id of the playlist
 * @returns all of the songs in a Spotify playlist, in Spotify object track format
 */
export async function fetchSongsFromPlaylist(
  playlistId: string
): Promise<SpotifyPlaylistObject> {
  const token = await fetchAccessToken();
  const response = await axios({
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    url: `https://api.spotify.com/v1/playlists/${playlistId}`,
  });

  const data = response.data;
  if (data.tracks.next) {
    data.tracks.items = data.tracks.items.concat(
      await fetchTracks(data.tracks.next, token)
    );
  }
  return data;
}

/**
 * Fetches some of the songs in a Spotify playlist
 *
 * @param nextUrl the url of the next block of Spotify songs
 * @param token a Spotify access token
 * @returns all of the songs in a Spotify playlist
 */
async function fetchTracks(
  nextUrl: string,
  token: string
): Promise<PlaylistTrackObject[]> {
  try {
    const response = await axios({
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      url: nextUrl,
    });
    let items = response.data.items;
    if (response.data.next) {
      items = items.concat(await fetchTracks(response.data.next, token));
    }
    return items;
  } catch (error) {
    return [];
  }
}
