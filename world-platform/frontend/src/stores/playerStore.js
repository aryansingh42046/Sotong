import { create } from 'zustand';

export const usePlayerStore = create((set) => ({
  position: { x: 50, y: 50 },
  floor: 1,
  currentRoomId: null,
  nearbyPlayers: [],
  allPlayers: {},

  setPosition: (x, y) => set({ position: { x, y } }),
  setFloor: (floor) => set({ floor }),
  setRoom: (roomId) => set({ currentRoomId: roomId }),

  updatePlayer: (userId, data) => set((s) => ({
    allPlayers: { ...s.allPlayers, [userId]: { ...s.allPlayers[userId], ...data } },
  })),

  removePlayer: (userId) => set((s) => {
    const p = { ...s.allPlayers };
    delete p[userId];
    return { allPlayers: p };
  }),

  setAllPlayers: (players) => {
    const map = {};
    players.forEach(p => { map[p.userId] = p; });
    set({ allPlayers: map });
  },
}));
