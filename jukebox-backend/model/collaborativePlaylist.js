const mongoose = require('mongoose');

const collaborativePlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String
  },
  songs: [
    {
      songId: String,
      title: String,
      artist: String,
      imageUrl: String,
      addedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String
      },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollaborativePlaylist', collaborativePlaylistSchema);
