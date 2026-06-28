import { create } from 'zustand';
import { api } from '../lib/api.js';

export const useWorldStore = create((set, get) => ({
  worlds: [],
  currentWorld: null,
  globeWorlds: [],

  fetchGlobeWorlds: async () => {
    const data = await api.get('/worlds/globe');
    set({ globeWorlds: data });
  },

  fetchWorlds: async (page = 1) => {
    const data = await api.get(`/worlds?page=${page}`);
    set({ worlds: data.worlds });
    return data;
  },

  fetchWorld: async (id) => {
    set({ currentWorld: null });
    const world = await api.get(`/worlds/${id}`);
    set({ currentWorld: world });
    return world;
  },

  createWorld: async (data) => {
    const world = await api.post('/worlds', data);
    set((s) => ({ worlds: [world, ...s.worlds], currentWorld: world }));
    return world;
  },

  updateWorldDesign: async (id, worldDesign) => {
    const updated = await api.put(`/worlds/${id}`, { worldDesign });
    set({ currentWorld: updated });
    return updated;
  },

  joinWorld: async (id) => {
    return api.post(`/worlds/${id}/join`);
  },

  enterWorld: async (worldId, avatarId) => {
    return api.post(`/worlds/${worldId}/enter`, { avatarId });
  },
}));
