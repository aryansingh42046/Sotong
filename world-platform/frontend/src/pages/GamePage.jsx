import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useAvatarStore } from '../stores/avatarStore.js';
import { useWorldStore } from '../stores/worldStore.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { getSocket } from '../lib/socket.js';
import GameCanvas from '../components/game/GameCanvas.jsx';

export default function GamePage() {
  const { id: worldId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedAvatar } = useAvatarStore();
  const { currentWorld, fetchWorld } = useWorldStore();
  const { setAllPlayers, updatePlayer, removePlayer, setPosition, floor: currentFloor } = usePlayerStore();
  const [roomName, setRoomName] = useState('');
  const [notification, setNotification] = useState('');
  const socket = getSocket();

  useEffect(() => {
    if (!selectedAvatar) { navigate(`/worlds/${worldId}/enter`); return; }
    fetchWorld(worldId);
  }, [worldId]);

  useEffect(() => {
    if (!socket || !worldId || !selectedAvatar) return;

    socket.emit('player:join-world', {
      worldId,
      avatarId: selectedAvatar.id,
      avatarConfig: selectedAvatar,
    });

    socket.on('world:players', setAllPlayers);
    socket.on('player:joined', (data) => updatePlayer(data.userId, data));
    socket.on('player:moved', (data) => updatePlayer(data.userId, data));
    socket.on('player:left', (data) => removePlayer(data.userId));

    return () => {
      socket.off('world:players');
      socket.off('player:joined');
      socket.off('player:moved');
      socket.off('player:left');
      socket.emit('player:disconnect');
    };
  }, [socket, worldId, selectedAvatar]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleMove = (x, y, direction) => {
    setPosition(x, y);
    socket?.emit('player:move', { worldId, x, y, floor: currentFloor, direction });
  };

  const handleEnterRoom = (roomId, name) => {
    setRoomName(name);
    socket?.emit('player:enter-room', { roomId, worldId });
  };

  const handleLeaveRoom = (roomId) => {
    setRoomName('');
    socket?.emit('player:leave-room', { roomId });
  };

  if (!currentWorld || currentWorld.id !== worldId) return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-gray-400 text-sm animate-pulse">Loading world…</div>
    </div>
  );

  return (
    <div className="w-full h-full flex bg-[#0a0a0f] overflow-hidden">
      {/* Game canvas */}
      <div className="flex-1 relative">
        <GameCanvas
          worldDesign={currentWorld.worldDesign}
          playerAvatar={selectedAvatar}
          playerId={user?.id}
          onMove={handleMove}
          onEnterRoom={handleEnterRoom}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* HUD */}
        <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
          <button onClick={() => navigate('/dashboard')} className="glass rounded-lg px-3 py-1.5 text-xs text-gray-400 hover:text-white">← Exit</button>
          <div className="glass rounded-lg px-3 py-1.5 text-xs text-white font-semibold">{currentWorld.name}</div>
          {roomName && <div className="glass rounded-lg px-3 py-1.5 text-xs text-indigo-300">📍 {roomName}</div>}
        </div>

        {/* Notification */}
        {notification && (
          <div className="absolute top-4 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="glass rounded-full px-4 py-2 text-xs text-white animate-in fade-in">{notification}</div>
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 z-10">
          <p className="text-xs text-gray-500">WASD / Arrow keys to move · E to interact</p>
        </div>

      </div>
    </div>
  );
}
