import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || '', {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('connect_error', (e) => console.error('Socket error:', e.message));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
