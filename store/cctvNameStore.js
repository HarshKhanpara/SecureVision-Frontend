import { create } from 'zustand';

export const useCctvNameStore = create((set) => ({
  cctvNames: [],

  // Set entire CCTV name list
  setCctvNames: (names) => set({ cctvNames: Array.from(new Set(names)) }),

  // Add a unique CCTV name
  addCctvName: (name) =>
    set((state) => {
      if (state.cctvNames.includes(name)) return state;
      return { cctvNames: [...state.cctvNames, name] };
    }),

  // Remove a CCTV name
  removeCctvName: (name) =>
    set((state) => ({
      cctvNames: state.cctvNames.filter((n) => n !== name),
    })),

  // Clear all CCTV names
  clearCctvNames: () => set({ cctvNames: [] }),
}));
