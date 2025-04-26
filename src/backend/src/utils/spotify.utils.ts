import axios from "axios";
import qs from "qs";
import { HttpException, PlaylistNotFoundException } from "./errors.utils";
import { SpotifyPlaylistObject, PlaylistTrackObject } from "../types";
import { SPOTIFY_CLIENT_KEY } from "../config";
import { log } from "./logger.utils";

/**
 * Produces a Spotify access token
 *
 * @returns a Spotify access token
 */
async function fetchAccessToken(): Promise<string> {
  try {
    const data = {
      grant_type: "client_credentials",
    };
    const options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${SPOTIFY_CLIENT_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(data),
      url: "https://accounts.spotify.com/api/token",
    };
    const response = await axios(options);
    return response.data.access_token;
  } catch (error) {
    log.error("Failed to fetch access token", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: fetchAccessToken.name,
      },
    });
    throw new HttpException(500, "Failed to fetch server access token");
  }
}

/**
 * Fetches a Spotify playlist.
 *
 * @param playlistId the id of the playlist
 * @param options options for fetching the playlist
 * @param options.fetchAllTracks whether to fetch all tracks in the playlist
 * @returns the Spotify playlist object
 */
export async function fetchPlaylist(
  playlistId: string,
  options: { fetchAllTracks: boolean } = { fetchAllTracks: false }
): Promise<SpotifyPlaylistObject> {
  const token = await fetchAccessToken();
  try {
    const response = await axios({
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    });

    const data = response.data;
    if (options.fetchAllTracks && data.tracks.next) {
      data.tracks.items = data.tracks.items.concat(
        await fetchTracks(data.tracks.next, token)
      );
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.status === 404)
        throw new PlaylistNotFoundException();
    }

    log.error("Failed to fetch playlist", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: fetchPlaylist.name,
        data: { playlistId },
      },
    });
    throw new HttpException(500, "Failed to fetch playlist");
  }
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
    log.error("Failed to fetch tracks", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: fetchTracks.name,
        data: { nextUrl },
      },
    });
    return [];
  }
}
