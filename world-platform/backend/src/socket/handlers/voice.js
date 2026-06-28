export const handleVoice = (io, socket) => {
  socket.on('offer:send', ({ peerId, offer }) => {
    io.to(peerId).emit('offer:received', { peerId: socket.id, offer });
  });

  socket.on('answer:send', ({ peerId, answer }) => {
    io.to(peerId).emit('answer:received', { peerId: socket.id, answer });
  });

  socket.on('icecandidate:send', ({ peerId, candidate }) => {
    io.to(peerId).emit('icecandidate:received', { peerId: socket.id, candidate });
  });

  socket.on('screen:start-share', ({ roomId }) => {
    socket.to(`room:${roomId}`).emit('screen:shared', { userId: socket.userId });
  });

  socket.on('screen:stop-share', ({ roomId }) => {
    socket.to(`room:${roomId}`).emit('screen:stopped', { userId: socket.userId });
  });
};
