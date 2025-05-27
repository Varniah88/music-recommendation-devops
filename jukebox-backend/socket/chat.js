const userSockets = {};
const roomMessages = {};
const privateMessages = {};

const {
  saveChatToS3,
  loadChatFromS3,
  savePrivateChatToS3,
  loadPrivateChatFromS3
} = require('../services/s3ChatService');

const User = require('../model/user'); // Add your User model

module.exports = (io) => {
  io.on('connection', async (socket) => {
    const email = socket.handshake.query.email;

    // Blocked user check
    if (email) {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          socket.disconnect();
          return;
        }

        if (user.blocked) {
          socket.emit('forcedLogout', 'You have been blocked by an administrator.');
          socket.disconnect();
          return;
        }

        // Save valid connection
        userSockets[email] = socket.id;
        console.log(`User connected: ${email}`);
      } catch (err) {
        console.error('Error checking blocked status:', err);
        socket.disconnect();
        return;
      }
    }

    // ===== GROUP CHAT =====
    socket.on('joinRoom', async (roomName) => {
      socket.join(roomName);

      if (!roomMessages[roomName]) {
        roomMessages[roomName] = await loadChatFromS3(roomName);
      }

      socket.emit('roomHistory', roomMessages[roomName]);
    });

    socket.on('chatMessage', async ({ room, message }) => {
      if (!roomMessages[room]) roomMessages[room] = [];
      roomMessages[room].push(message);
      io.to(room).emit('chatMessage', message);
      await saveChatToS3(room, roomMessages[room]);
    });

    // ===== PRIVATE CHAT =====
    socket.on('privateMessage', async ({ to, message, sender }) => {
      const targetSocketId = userSockets[to];
      const key = [sender, to].sort().join('_');

      if (!privateMessages[key]) {
        privateMessages[key] = await loadPrivateChatFromS3(sender, to);
      }

      privateMessages[key].push(message);

      if (targetSocketId) {
        io.to(targetSocketId).emit('privateMessage', { message, sender });
        console.log(`Private message from ${sender} to ${to}: ${message}`);
      }

      await savePrivateChatToS3(sender, to, privateMessages[key]);
    });

    // Load private chat history
    socket.on('loadPrivateChat', async ({ withUser }) => {
      const me = socket.handshake.query.email;
      const key = [me, withUser].sort().join('_');

      if (!privateMessages[key]) {
        privateMessages[key] = await loadPrivateChatFromS3(me, withUser);
      }

      socket.emit('privateChatHistory', {
        withUser,
        history: privateMessages[key],
      });
    });

    socket.on('disconnect', () => {
      if (email && userSockets[email]) {
        delete userSockets[email];
        console.log(`Disconnected: ${email}`);
      }
    });
  });
};
