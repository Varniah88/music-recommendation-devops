const Playlist = require('../model/playlist.js');

exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find(); 
    res.json(playlists);
  } catch (error) {
    console.error('Failed to get playlists', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  const { playlistId, trackId } = req.params;

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

    const initialLength = playlist.songs.length;
    playlist.songs = playlist.songs.filter(song => song.track_id !== trackId);

    if (playlist.songs.length === initialLength) {
      return res.status(404).json({ message: 'Song not found in playlist' });
    }

    await playlist.save();
    res.json(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error removing song from playlist' });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id;
    const deleted = await Playlist.findByIdAndDelete(playlistId);

    if (!deleted) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.status(200).json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePlaylistName = async (req, res) => {
  const { playlistId } = req.params;
  const { playlist_name } = req.body;

  if (!playlist_name) {
    return res.status(400).json({ message: 'Playlist name is required' });
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { playlist_name },
      { new: true }
    );
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPlaylist = async (req, res) => {
  const { playlist_name, songs } = req.body;

  if (!playlist_name || !songs || !Array.isArray(songs)) {
    return res.status(400).json({ message: 'Invalid playlist data' });
  }

  try {
    const newPlaylist = new Playlist({ playlist_name, songs });
    await newPlaylist.save();
    res.status(201).json({ message: 'Playlist created successfully', playlist: newPlaylist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
