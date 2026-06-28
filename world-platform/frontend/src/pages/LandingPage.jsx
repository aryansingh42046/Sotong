import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobeViewer from '../components/globe/GlobeViewer.jsx';
import GlobeColorPicker from '../components/globe/GlobeColorPicker.jsx';
import { useWorldStore } from '../stores/worldStore.js';
import { useAuthStore } from '../stores/authStore.js';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { globeWorlds, fetchGlobeWorlds } = useWorldStore();
  const [globeColor, setGlobeColor] = useState('#1a237e');
  const [search, setSearch] = useState('');
  const [selectedWorld, setSelectedWorld] = useState(null);

  useEffect(() => { fetchGlobeWorlds(); }, []);

  const filtered = globeWorlds.filter(w =>
    !search || w.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectWorld = (world) => {
    setSelectedWorld(world);
  };

  const handleEnter = () => {
    if (!user) { navigate('/auth/login'); return; }
    navigate(`/worlds/${selectedWorld.id}/enter`);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #020208 100%)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 z-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <span className="font-bold text-white text-lg tracking-tight">WorldPlatform</span>
        </div>
        <div className="flex items-center gap-3">
          <GlobeColorPicker value={globeColor} onChange={setGlobeColor} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search worlds…"
            className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-500 w-48"
          />
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">
              Dashboard
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => navigate('/auth/login')} className="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/5">Sign in</button>
              <button onClick={() => navigate('/auth/register')} className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium">Get started</button>
            </div>
          )}
        </div>
      </header>

      {/* Globe */}
      <div className="flex-1 relative">
        <GlobeViewer worlds={filtered} globeColor={globeColor} onSelectWorld={handleSelectWorld} />

        {/* Center label */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-gray-500 text-xs tracking-widest uppercase">
              {globeWorlds.length} worlds · drag to rotate · scroll to zoom
            </p>
          </div>
        </div>

        {/* World detail panel */}
        {selectedWorld && (
          <div className="absolute right-6 top-6 glass rounded-2xl p-5 w-72 z-20 animate-in">
            <button onClick={() => setSelectedWorld(null)} className="absolute top-3 right-3 text-gray-500 hover:text-white text-lg">✕</button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: selectedWorld.globeColor || '#6366f1' }}>
                🌐
              </div>
              <div>
                <h3 className="font-bold text-white">{selectedWorld.name}</h3>
                <p className="text-xs text-gray-400">{selectedWorld._count?.members || 0} members</p>
              </div>
            </div>
            {selectedWorld.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-3">{selectedWorld.description}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleEnter}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold"
              >
                Enter World
              </button>
              <button
                onClick={() => navigate(`/worlds/${selectedWorld.id}`)}
                className="px-3 py-2 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5"
              >
                Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
