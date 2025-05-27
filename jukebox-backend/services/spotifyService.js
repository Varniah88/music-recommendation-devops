const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

const getAccessToken = async () => {
  const data = await spotifyApi.clientCredentialsGrant();
  spotifyApi.setAccessToken(data.body.access_token);
};

const getSongById = async (trackId) => {
  await getAccessToken();
  const result = await spotifyApi.getTrack(trackId);
  return result.body;
};

const getSongByName = async (query) => {
  if (!query || query.trim() === "") {
    console.error("Search query is empty.");
    return;
  }
  await getAccessToken();
  const data = await spotifyApi.searchTracks(query, { limit: 5 });
  return data.body.tracks.items;
};
const getArtistById = async (artistId) => {
  await getAccessToken();
  const result = await spotifyApi.getArtist(artistId);
  return {
    id: result.body.id,
    name: result.body.name,
    image: result.body.images?.[0]?.url || null,
    genres: result.body.genres,
  };
};

module.exports = { getSongById, getSongByName, getArtistById };
