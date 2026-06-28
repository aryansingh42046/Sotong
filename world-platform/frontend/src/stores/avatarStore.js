import { create } from 'zustand';
import { api } from '../lib/api.js';

export const DEFAULT_AVATAR = {
  name: 'My Avatar',
  gender: 'other',
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'black',
  facialFeatures: { eyesShape: 'round', eyesColor: 'brown', nose: 'medium', mouth: 'smile' },
  clothing: { top: 'tshirt', topColor: '#6366f1', bottom: 'jeans', bottomColor: '#1e3a5f', shoes: 'sneakers', shoesColor: '#ffffff' },
  accessories: { hat: 'none', glasses: 'none', backpack: 'no' },
};

export const useAvatarStore = create((set, get) => ({
  avatars: [],
  selectedAvatar: null,
  previewConfig: { ...DEFAULT_AVATAR },

  fetchAvatars: async () => {
    const avatars = await api.get('/avatars');
    set({ avatars });
    const def = avatars.find(a => a.isDefault);
    if (def) set({ selectedAvatar: def });
  },

  createAvatar: async (config) => {
    const avatar = await api.post('/avatars', config);
    set((s) => ({ avatars: [avatar, ...s.avatars], selectedAvatar: avatar }));
    return avatar;
  },

  updateAvatar: async (id, config) => {
    const avatar = await api.put(`/avatars/${id}`, config);
    set((s) => ({ avatars: s.avatars.map(a => a.id === id ? avatar : a) }));
    return avatar;
  },

  setDefault: async (id) => {
    await api.post(`/avatars/${id}/set-default`);
    set((s) => ({
      avatars: s.avatars.map(a => ({ ...a, isDefault: a.id === id })),
      selectedAvatar: s.avatars.find(a => a.id === id),
    }));
  },

  selectAvatar: (avatar) => set({ selectedAvatar: avatar }),
  updatePreview: (changes) => set((s) => ({ previewConfig: { ...s.previewConfig, ...changes } })),
}));
