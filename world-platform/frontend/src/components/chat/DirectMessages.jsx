import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api.js';
import { useAuthStore } from '../../stores/authStore.js';

export default function DirectMessages({ targetUserId, onClose }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!targetUserId) return;
    const load = async () => {
      try {
        const data = await api.get(`/messages/direct/${targetUserId}`);
        setMessages(data);
      } catch (e) {
        console.error('Failed to load direct messages', e);
      }
    };
    load();
  }, [targetUserId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    try {
      const dm = await api.post(`/messages/direct/${targetUserId}`, { content: input });
      setMessages(prev => [...prev, dm]);
      setInput('');
    } catch (err) {
      console.error('Failed to send DM', err);
    }
  };

  return (
    <div className="glass rounded-2xl p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Direct Messages</h3>
        <div className="flex gap-2">
          <button onClick={() => onClose?.()} className="text-xs text-gray-400 hover:text-white">Close</button>
        </div>
      </div>

      <div className="h-64 overflow-y-auto p-2 bg-transparent border border-white/5 rounded-md space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`text-sm ${m.senderId === user?.id ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-gray-400">{m.senderId === user?.id ? 'You' : (m.sender?.username || 'User')}</div>
            <div className="text-sm text-white">{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Write a message..." className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none" />
        <button type="submit" className="px-3 py-2 bg-indigo-600 rounded text-white text-sm">Send</button>
      </form>
    </div>
  );
}
