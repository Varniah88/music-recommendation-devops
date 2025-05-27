const SpotifyWebApi = require('spotify-web-api-node');
const User = require('../model/user');
const jwt = require('jsonwebtoken');

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
  });  

const spotifyLogin = (req, res) => {
  const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
  const authURL = spotifyApi.createAuthorizeURL(scopes) + '&show_dialog=true';
  res.redirect(authURL);
};

const spotifyCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Spotify login error:', error);
    return res.status(400).send(`Login failed: ${error}`);
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body.access_token;
    const refreshToken = data.body.refresh_token;
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    const profileRes = await spotifyApi.getMe();
    const profile = profileRes.body;

    let user = await User.findOne({ 'spotify.id': profile.id });

    if (!user) {
      user = await User.findOne({ email: profile.email });

      if (user) {
        user.spotify = {
          id: profile.id,
          displayName: profile.display_name,
          email: profile.email,
          accessToken,
          refreshToken,
        };
      } else {
        user = new User({
          username: profile.display_name?.replace(/\s/g, '') || `spotify_${profile.id}`,
          email: profile.email,
          spotify: {
            id: profile.id,
            displayName: profile.display_name,
            email: profile.email,
            accessToken,
            refreshToken,
          },
        });
      }

      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    //res.redirect(`${process.env.FRONTEND_URL}/spotify-auth-success?token=${token}`);
    res.status(200).json({
        message: 'Spotify login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          spotify: {
            id: user.spotify.id,
            displayName: user.spotify.displayName,
            email: user.spotify.email,
          }
        }
      });
      
    }  catch (err) {
      console.error('Callback Error:', err.response?.data || err.message);
      res.status(500).send('Spotify login failed');
    }  
}

module.exports = { spotifyLogin, spotifyCallback };
