// socket/index.js
const collabPlaylistHandler = require('./collabPlaylist');

let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('🎧 Socket connected:', socket.id);
      collabPlaylistHandler(io, socket); // Delegate to playlist logic
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized!');
    }
    return io;
  },
};
