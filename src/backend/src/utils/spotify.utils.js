const axios = require("axios");
const querystring = require("querystring");

/**
 * Produces a Spotify access token
 *
 * @returns a Spotify access token
 */
async function fetchAccessToken() {
  return new Promise(async (resolve, reject) => {
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
    const response = (await axios(options)).data;
    const accessToken = response.access_token;
    resolve(accessToken);
  });
}

/**
 * Fetches all of the songs in a Spotify playlist
 *
 * @param playlistId the id of the playlist
 * @param token a Spotify access token
 * @returns all of the songs in a Spotify playlist, in Spotify object track format
 */
async function fetchSongsFromPlaylist(playlistId, token) {
  return new Promise((resolve, reject) => {
    axios({
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      url: `https://api.spotify.com/v1/playlists/${playlistId}`,
    })
      .then(async (response) => {
        let data = response.data;
        if (data.tracks.next) {
          data.tracks.items = data.tracks.items.concat(
            await fetchTracks(data.tracks.next, token)
          );
        }
        resolve(data);
      })
      .catch((err) => reject(err));
  });
}

/**
 * Fetches some of the songs in a Spotify playlist
 *
 * @param nextUrl the url of the next block of Spotify songs
 * @param token a Spotify access token
 * @returns all of the songs in a Spotify playlist
 */
async function fetchTracks(nextUrl, token) {
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
    console.error(error);
    return [];
  }
}

module.exports = { fetchAccessToken, fetchSongsFromPlaylist };
