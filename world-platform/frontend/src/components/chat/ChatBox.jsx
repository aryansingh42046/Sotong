import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../lib/socket.js';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../stores/authStore.js';

export default function ChatBox({ roomId }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (!roomId) return;
    const load = async () => {
      try {
        const data = await api.get(`/messages/rooms/${roomId}`);
        setMessages(data);
      } catch { /* noop */ }
    };
    load();
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => setMessages(p => [...p.slice(-200), msg]);
    socket.on('message:room-received', handler);
    return () => { socket.off('message:room-received', handler); };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('message:room-send', { roomId, content: input });
    setInput('');
  };

  if (!roomId) {
    return <div className="flex items-center justify-center h-full text-gray-500 text-xs p-4">Enter a room to chat.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`text-xs ${m.userId === user?.id ? 'text-right' : ''}`}>
            <span className="text-gray-500">{m.username || m.user?.username || 'User'}: </span>
            <span className="text-gray-200">{m.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="p-2 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message…"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white">→</button>
        </div>
      </form>
    </div>
  );
}
