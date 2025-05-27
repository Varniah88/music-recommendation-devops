const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  track_id: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  duration: { type: String, required: true }, // "3:42" format
  image: { type: String, required: true }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
  playlist_name: { type: String, required: true },
  songs: [songSchema]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema, 'playlists');
