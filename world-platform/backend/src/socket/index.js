import jwt from 'jsonwebtoken';
import { handleMovement } from './handlers/movement.js';
import { handleChat } from './handlers/chat.js';
import { handleVoice } from './handlers/voice.js';
import { handlePresence } from './handlers/presence.js';

export const setupSocketHandlers = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    handleMovement(io, socket);
    handleChat(io, socket);
    handleVoice(io, socket);
    handlePresence(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
      socket.to(socket.currentWorld).emit('player:left', { userId: socket.userId });
    });
  });
};
