import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWorldStore } from '../stores/worldStore.js';
import { useAuthStore } from '../stores/authStore.js';

export default function WorldDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentWorld, fetchWorld, joinWorld } = useWorldStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchWorld(id); }, [id]);

  if (!currentWorld || currentWorld.id !== id) return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
      <span className="text-gray-400 text-sm animate-pulse">Loading…</span>
    </div>
  );

  const isOwner = currentWorld.ownerId === user?.id;

  return (
    <div className="w-full h-full overflow-auto bg-[#0a0a0f]">
      <header className="sticky top-0 z-10 glass border-b border-white/5 px-6 py-3 flex items-center gap-3">
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-white font-semibold">{currentWorld.name}</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: currentWorld.globeColor || '#6366f1' }}>🌐</div>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentWorld.name}</h1>
            <p className="text-gray-400 text-sm mt-1">by @{currentWorld.owner?.username} · {currentWorld._count?.members || 0} members</p>
          </div>
          <div className="ml-auto flex gap-3">
            {isOwner && <Link to={`/worlds/${id}/edit`} className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5">Edit World</Link>}
            <button onClick={() => navigate(`/worlds/${id}/enter`)} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">Enter World</button>
          </div>
        </div>

        {currentWorld.description && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{currentWorld.description}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-white">{currentWorld._count?.members || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Members</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-2xl font-bold text-white">{currentWorld.worldCapacity}</p>
            <p className="text-xs text-gray-500 mt-1">Capacity</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-sm font-bold text-white capitalize">{currentWorld.visibility}</p>
            <p className="text-xs text-gray-500 mt-1">Visibility</p>
          </div>
        </div>
      </div>
    </div>
  );
}
