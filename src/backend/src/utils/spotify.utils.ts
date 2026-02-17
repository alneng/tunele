import axios from "axios";
import qs from "qs";
import { HttpException, PlaylistNotFoundException } from "./errors.utils";
import { SpotifyPlaylistObject, PlaylistTrackObject } from "../types";
import config from "../config";
import Logger from "./logger.utils";
import { RedisService } from "../lib/redis.service";
import { CacheKeys } from "./redis.utils";
import { spotifyMetrics } from "../metrics/spotify.metrics";
import { startTimer } from "../metrics/registry";

/**
 * Produces a Spotify access token
 *
 * @returns a Spotify access token
 */
async function fetchAccessToken(): Promise<string> {
  const end = startTimer();
  try {
    const token = await RedisService.getString(CacheKeys.SPOTIFY_ACCESS_TOKEN);
    if (token) return token;

    const options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${config.spotify.clientKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({ grant_type: "client_credentials" }),
      url: "https://accounts.spotify.com/api/token",
    };
    const response = await axios(options);
    const { access_token, expires_in } = response.data;

    spotifyMetrics.recordRequest("token", "success", end());

    // Cache the access token for the duration of its validity minus a buffer of 60 seconds
    await RedisService.setString(
      CacheKeys.SPOTIFY_ACCESS_TOKEN,
      access_token,
      expires_in - 60,
    );

    return access_token;
  } catch (error) {
    spotifyMetrics.recordRequest("token", "error", end());

    Logger.error("Failed to fetch access token", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      method: fetchAccessToken.name,
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
  options: { fetchAllTracks: boolean } = { fetchAllTracks: false },
): Promise<SpotifyPlaylistObject> {
  const token = await fetchAccessToken();
  const end = startTimer();
  try {
    const response = await axios({
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    });

    spotifyMetrics.recordRequest("playlist", "success", end());

    const data = response.data;
    if (options.fetchAllTracks && data.tracks.next) {
      data.tracks.items = data.tracks.items.concat(
        await fetchTracks(data.tracks.next, token),
      );
    }
    return data;
  } catch (error) {
    spotifyMetrics.recordRequest("playlist", "error", end());

    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data;
      if (errorData.error?.status === 404)
        throw new PlaylistNotFoundException();
    }

    Logger.error("Failed to fetch playlist", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      method: fetchPlaylist.name,
      data: { playlistId },
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
  token: string,
): Promise<PlaylistTrackObject[]> {
  const end = startTimer();
  try {
    const response = await axios({
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      url: nextUrl,
    });

    spotifyMetrics.recordRequest("tracks", "success", end());

    let items = response.data.items;
    if (response.data.next) {
      items = items.concat(await fetchTracks(response.data.next, token));
    }
    return items;
  } catch (error) {
    spotifyMetrics.recordRequest("tracks", "error", end());

    Logger.error("Failed to fetch tracks", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      method: fetchTracks.name,
      data: { nextUrl },
    });
    return [];
  }
}
