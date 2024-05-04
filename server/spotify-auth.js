
const axios = require('axios');
const qs = require('querystring');
const clientId = "c15b75e0f897402382da47ca5def4923";
const clientSecret = "08143f9d064c4df4a6567857cf80e5cf";

async function fetchUrl(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}


const getSpotifyAccessToken = async () => {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Spotify API error: ${data.error} - ${data.error_description}`);
        }
        return data.access_token;
    } catch (error) {
        console.error('Error retrieving Spotify access token:', error);
        return null;
    }
};

const searchSpotifyForArtistByTitle = async (title) => {
  const accessToken = await getSpotifyAccessToken();
  if (!accessToken) {
    throw new Error("Failed to obtain access token.");
  }
  try {
    const { data } = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        q: title,
        type: 'track',
        limit: 1
      }
    });
    if (data.tracks.items.length > 0 && data.tracks.items[0].artists.length > 0) {
      return data.tracks.items[0].artists[0].name; // Return the name of the first artist of the first track
    }
    return null;
  } catch (error) {
    console.error('Failed to search for artist by title:', error.response ? error.response.data : error.message);
    throw error;
  }
};


module.exports = { searchSpotifyForArtistByTitle };