import { redis } from '../../lib/redis.js';

export const handleMovement = (io, socket) => {
  socket.on('player:join-world', async ({ worldId, avatarId, avatarConfig }) => {
    socket.currentWorld = worldId;
    socket.avatarId = avatarId;
    socket.avatarConfig = avatarConfig;
    socket.join(`world:${worldId}`);

    await redis.hset(`world:${worldId}:players`, socket.userId, JSON.stringify({
      userId: socket.userId, x: 50, y: 50, floor: 1, avatarConfig,
    }));

    // Send existing players to new user
    const players = await redis.hgetall(`world:${worldId}:players`);
    const parsedPlayers = Object.values(players || {}).map(p => JSON.parse(p)).filter(p => p.userId !== socket.userId);
    socket.emit('world:players', parsedPlayers);

    socket.to(`world:${worldId}`).emit('player:joined', { userId: socket.userId, x: 50, y: 50, floor: 1, avatarConfig });
  });

  socket.on('player:move', async ({ worldId, x, y, floor, direction }) => {
    const playerData = { userId: socket.userId, x, y, floor, direction, avatarConfig: socket.avatarConfig };
    await redis.hset(`world:${worldId}:players`, socket.userId, JSON.stringify(playerData));
    socket.to(`world:${worldId}`).emit('player:moved', playerData);
  });

  socket.on('player:enter-room', ({ roomId, worldId }) => {
    if (socket.currentRoomId) socket.leave(`room:${socket.currentRoomId}`);
    socket.currentRoomId = roomId;
    socket.join(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('room:user-joined', { userId: socket.userId, roomId });
  });

  socket.on('player:leave-room', ({ roomId }) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('room:user-left', { userId: socket.userId, roomId });
    socket.currentRoomId = null;
  });
};
