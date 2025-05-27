// socket/collabPlaylist.js
const playlists = {}; // Shared across connections
const userMap = {}
module.exports = (io, socket) => {
  console.log('⚡ Handling playlist events for', socket.id);

  socket.emit('welcome', '👋 Welcome to the Jukebox socket server!');

  socket.on('joinPlaylist', ({playlistId,username,playlistName} ) => {
    socket.join(`playlist-${playlistId}`);
    userMap[socket.id] = username;
     console.log(`✅ User ${username} joined playlist - ${playlistName} `);
    // Emit to others in the room that a new user joined
    socket.to(`playlist-${playlistId}`).emit('userJoined', {
      userId: socket.id, // or user name if you track it
      username,
      message: `A user joined playlist-${playlistId}`
    });

    if (playlists[playlistId]) {
      socket.emit('updatePlaylist', playlists[playlistId]);
    }
  });

socket.on('songAdded', ({ playlistId, song }) => {
    socket.join(`playlist-${playlistId}`);
    userMap[socket.id] = song.addedBy.username;
    console.log(`🎶➕ song    ${song.title} added by ${song.addedBy.username}`);
    // Broadcast to all clients in the playlist room
    io.to(`playlist-${playlistId}`).emit('songAdded', { playlistId, song });
});


socket.on('leavePlaylist', ({ playlistId, username, playlistName }) => {
  socket.leave(`playlist-${playlistId}`);
  userMap[socket.id] = username;
    console.log(`❌ User ${username} left playlist - ${playlistName}`);
});

  socket.on('disconnect', () => {
    const username = userMap[socket.id];
    console.log(`🔒 Socket disconnected: ${socket.id} (${username || 'Unknown user'})`);
    delete userMap[socket.id];
  });
};
