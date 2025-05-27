const Playlist = require('../model/collaborativePlaylist');
const UserPlaylist = require('../model/playlist');
const socketManager = require('../socket');
const Song = require('../model/song');



exports.getPlaylists = async (req, res) => {
  const playlists = await Playlist.find().sort({ createdAt: -1 });
  res.json(playlists);
};

exports.createPlaylist = async (req, res) => {
  const { name, userId, username } = req.body;
  const imageFile = req.file;

   if (!imageFile) {
    return res.status(400).json({ message: 'Image is required' });
  }

 const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;
  
  const playlist = new Playlist({
    name,
    imageUrl,
    createdBy: { userId, username },
    songs: []
  });

  await playlist.save();

  // Emit with full image URL for socket clients
const fullImageUrl = `http://localhost:3000${imageUrl}`;
const playlistData = playlist.toObject();
playlistData.imageUrl = fullImageUrl;

console.log(`🎧 Playlist ${playlist.name} is added by ${username}`);
 socketManager.getIO().emit('playlistCreated', playlist);
  res.status(201).json({ message: 'Playlist created', playlist });
};


exports.addSong = async (req, res) => {
  const { playlistId } = req.params;
  const { songId, userId, username } = req.body;

  // Find the playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

  // Fetch song from Song collection
  const song = await Song.findById(songId);
  if (!song) return res.status(404).json({ message: 'Song not found in database.' });


  //Check song is already added
  const songAlreadyExists = playlist.songs.some(s => String(s.songId) === String(song._id));
  if (songAlreadyExists) {
    return res.status(400).json({ message: 'Song already added.' });
  }

  // Push song data from DB, not from client
  playlist.songs.push({
    track_id: song._id,
    title: song.name,
    artist: song.artists.map(artist => artist.name).join(', '),
    imageUrl: song.album.images?.[0]?.url,
    addedBy: { userId, username },
    addedAt: new Date()
  });

  await playlist.save();
  socketManager.getIO()
    .to(`playlist-${playlistId}`) // only people in the playlist room
    .emit('songAdded', {
      playlistId,
      song: playlist.songs.at(-1)
    });

  res.json({ message: 'Song added', playlist });

};


exports.removeSong = async (req, res) => {
  const { playlistId } = req.params;
  const { songId, userId } = req.body;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

  if (String(playlist.createdBy.userId) !== userId)
    return res.status(403).json({ message: 'Only the creator can remove songs' });
  const songExists = playlist.songs.some(song => String(song.songId) === String(songId));
  if (!songExists)
    return res.status(403).json({ message: 'song not found' });

  playlist.songs = playlist.songs.filter(song => song.songId !== songId);
  await playlist.save();

  // Emit event to specific playlist room only
  socketManager.getIO().to(`playlist-${playlistId}`).emit('songRemoved', { playlistId, songId });

  res.json({ message: 'Song removed', playlist });
};

exports.savePlaylistToUser = async (req, res) => {
  const { playlistId } = req.params;
  const { userId } = req.body;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) return res.status(404).json({ message: 'Playlist not found' });

  const userPlaylist = new UserPlaylist({
    userId: userId,
    playlist_name: playlist.playlist_name || playlist.name || 'Untitled Playlist',
    songs: playlist.songs.map(song => ({
      track_id: song.track_id || song.songId || '', // fallback if needed
      title: song.title || '',
      artist: song.artist || '',
      album: song.album || '',
      duration: song.duration || 0,
      image: song.image || '',
      timestamp: new Date()
    }))
  });


  await userPlaylist.save();

  res.json({ message: 'Playlist saved', userPlaylist });
};

console.log('getPlaylists function exported:', exports.getPlaylists);