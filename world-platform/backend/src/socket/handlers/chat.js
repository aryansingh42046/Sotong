export const handleChat = (io, socket) => {
  socket.on('message:room-send', ({ roomId, content }) => {
    const payload = { userId: socket.userId, roomId, content, timestamp: new Date().toISOString() };
    io.to(`room:${roomId}`).emit('message:room-received', payload);
  });

  socket.on('user:typing', ({ roomId, isTyping }) => {
    socket.to(`room:${roomId}`).emit('user:typing-indicator', { userId: socket.userId, isTyping });
  });
};
