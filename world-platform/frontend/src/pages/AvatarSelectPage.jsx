import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAvatarStore } from '../stores/avatarStore.js';
import { useWorldStore } from '../stores/worldStore.js';
import AvatarCanvas from '../components/avatar/AvatarCanvas.jsx';
import AvatarCreator from '../components/avatar/AvatarCreator.jsx';

export default function AvatarSelectPage() {
  const { id: worldId } = useParams();
  const navigate = useNavigate();
  const { avatars, selectedAvatar, selectAvatar, fetchAvatars } = useAvatarStore();
  const { enterWorld } = useWorldStore();
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => { fetchAvatars(); }, []);

  const handleEnter = async () => {
    if (!selectedAvatar) return;
    await enterWorld(worldId, selectedAvatar.id);
    navigate(`/worlds/${worldId}/play`);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
      {showCreator ? (
        <div className="glass rounded-2xl p-6 w-full max-w-2xl h-[80vh]">
          <h2 className="text-lg font-bold text-white mb-4">Create Avatar</h2>
          <AvatarCreator
            onSave={(avatar) => { selectAvatar(avatar); setShowCreator(false); }}
            onCancel={() => setShowCreator(false)}
          />
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 w-full max-w-lg">
          <h2 className="text-xl font-bold text-white mb-2">Choose your avatar</h2>
          <p className="text-gray-400 text-sm mb-6">Select how you'll appear in this world</p>

          {avatars.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🎭</span>
              <p className="text-gray-400 text-sm mt-3">No avatars yet</p>
              <button onClick={() => setShowCreator(true)} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-semibold">
                Create Avatar
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {avatars.map(a => (
                  <button
                    key={a.id}
                    onClick={() => selectAvatar(a)}
                    className={`glass rounded-xl p-4 flex flex-col items-center gap-2 transition-all border ${selectedAvatar?.id === a.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent hover:border-white/20'}`}
                  >
                    <AvatarCanvas config={a} size={64} />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{a.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowCreator(true)}
                  className="glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 hover:border-indigo-500 text-gray-500 hover:text-indigo-400"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs">New</span>
                </button>
              </div>
              <button
                onClick={handleEnter}
                disabled={!selectedAvatar}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enter World →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
