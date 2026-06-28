import { redis } from '../../lib/redis.js';

export const handlePresence = (io, socket) => {
  socket.on('presence:online', async () => {
    await redis.set(`presence:${socket.userId}`, 'online', 'EX', 300);
    socket.broadcast.emit('presence:update', { userId: socket.userId, status: 'online' });
  });

  socket.on('disconnect', async () => {
    await redis.del(`presence:${socket.userId}`);
    if (socket.currentWorld) {
      await redis.hdel(`world:${socket.currentWorld}:players`, socket.userId);
    }
    socket.broadcast.emit('presence:update', { userId: socket.userId, status: 'offline' });
  });
};
