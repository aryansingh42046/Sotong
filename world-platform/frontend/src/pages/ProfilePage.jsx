import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useAvatarStore } from '../stores/avatarStore.js';
import { api } from '../lib/api.js';
import AvatarCanvas from '../components/avatar/AvatarCanvas.jsx';
import AvatarCreator from '../components/avatar/AvatarCreator.jsx';
import DirectMessages from '../components/chat/DirectMessages.jsx';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { avatars, fetchAvatars, setDefault, selectedAvatar } = useAvatarStore();
  const [profile, setProfile] = useState(null);
  const [showCreator, setShowCreator] = useState(false);
  const isMe = id === 'me' || id === user?.id;

  useEffect(() => {
    if (isMe) { setProfile(user); fetchAvatars(); }
    else { api.get(`/users/${id}`).then(setProfile).catch(() => {}); }
  }, [id]);

  if (!profile) return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
      <span className="text-gray-400 text-sm animate-pulse">Loading…</span>
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto bg-[#0a0a0f]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">@{profile.username}</h1>
              {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
            </div>
          </div>
        </div>

        {!isMe && (
          <div className="glass rounded-2xl p-6 mb-6">
            <DirectMessages targetUserId={id} />
          </div>
        )}

        {isMe && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Your Avatars</h2>
              <button onClick={() => setShowCreator(true)} className="text-xs text-indigo-400 hover:text-indigo-300">+ New Avatar</button>
            </div>

            {showCreator ? (
              <div className="h-96">
                <AvatarCreator onSave={() => { fetchAvatars(); setShowCreator(false); }} onCancel={() => setShowCreator(false)} />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {avatars.map(a => (
                  <div key={a.id} className={`glass rounded-xl p-3 flex flex-col items-center gap-2 border ${a.isDefault ? 'border-indigo-500' : 'border-transparent'}`}>
                    <AvatarCanvas config={a} size={64} />
                    <span className="text-xs text-gray-400 truncate w-full text-center">{a.name}</span>
                    {!a.isDefault && (
                      <button onClick={() => setDefault(a.id)} className="text-xs text-gray-600 hover:text-indigo-400">Set default</button>
                    )}
                    {a.isDefault && <span className="text-xs text-indigo-400">✓ Default</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
