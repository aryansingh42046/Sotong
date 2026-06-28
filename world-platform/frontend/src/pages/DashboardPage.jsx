import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useWorldStore } from '../stores/worldStore.js';
import { useAvatarStore } from '../stores/avatarStore.js';
import AvatarCanvas from '../components/avatar/AvatarCanvas.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { worlds, fetchWorlds, createWorld } = useWorldStore();
  const { avatars, fetchAvatars } = useAvatarStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newWorld, setNewWorld] = useState({ name: '', description: '', globeColor: '#6366f1' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => { fetchWorlds(); fetchAvatars(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const world = await createWorld(newWorld);
      setShowCreate(false);
      navigate(`/worlds/${world.id}/edit`);
    } catch (err) {
      setCreateError(err.message || 'Failed to create world');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-[#0a0a0f]">
      {/* Top nav */}
      <header className="sticky top-0 z-10 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🌍</span>
          <span className="font-bold text-white">WorldPlatform</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">@{user?.username}</span>
          <button onClick={logout} className="text-xs text-gray-600 hover:text-gray-400">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your worlds & avatar</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-semibold">
            + New World
          </button>
        </div>

        {/* Avatars row */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Your Avatars</h2>
            <Link to="/profile/me" className="text-xs text-indigo-400 hover:text-indigo-300">Edit →</Link>
          </div>
          <div className="flex gap-3 flex-wrap">
            {avatars.map(a => (
              <div key={a.id} className={`glass rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-500 border ${a.isDefault ? 'border-indigo-500' : 'border-transparent'}`}>
                <AvatarCanvas config={{ ...a, clothing: a.clothing, accessories: a.accessories, facialFeatures: a.facialFeatures }} size={64} />
                <span className="text-xs text-gray-400">{a.name}</span>
                {a.isDefault && <span className="text-xs text-indigo-400">Default</span>}
              </div>
            ))}
            <Link to="/profile/me" className="glass rounded-xl p-3 flex flex-col items-center justify-center gap-2 w-24 h-24 border border-dashed border-white/10 hover:border-indigo-500 text-gray-500 hover:text-indigo-400 text-2xl">
              +
            </Link>
          </div>
        </section>

        {/* Worlds */}
        <section>
          <h2 className="font-semibold text-white mb-3">Explore Worlds</h2>
          {worlds.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-gray-500">
              <span className="text-4xl">🌐</span>
              <p className="mt-3 text-sm">No worlds yet. Create the first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {worlds.map(w => (
                <div key={w.id} className="glass rounded-2xl p-4 hover:border-indigo-500/40 border border-transparent transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: w.globeColor || '#6366f1' }}>🌐</div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-sm truncate">{w.name}</h3>
                      <p className="text-xs text-gray-500">{w._count?.members || 0} members</p>
                    </div>
                  </div>
                  {w.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{w.description}</p>}
                  <div className="flex gap-2">
                    <Link to={`/worlds/${w.id}/enter`} className="flex-1 py-1.5 text-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">Enter</Link>
                    <Link to={`/worlds/${w.id}`} className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 text-xs hover:bg-white/5">Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create World Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-white mb-4">Create New World</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {createError && <p className="text-xs text-red-400">{createError}</p>}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">World Name</label>
                <input value={newWorld.name} onChange={e => setNewWorld(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
                  placeholder="My Awesome World" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={newWorld.description} onChange={e => setNewWorld(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500 resize-none h-20"
                  placeholder="What's this world about?" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Globe Marker Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={newWorld.globeColor} onChange={e => setNewWorld(p => ({ ...p, globeColor: e.target.value }))} className="w-8 h-8 cursor-pointer rounded" />
                  <span className="text-xs text-gray-500">Appears as a pin on the globe</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50">
                  {creating ? 'Creating…' : 'Create World'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
