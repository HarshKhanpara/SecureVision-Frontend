import { create } from 'zustand';

export const useIpStore = create((set) => ({
  ip: '',
  setIp: (newIp) => set({ ip: newIp }),
}));
