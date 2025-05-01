import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useIpStore = create(
    (set) => ({
      ips: [],

      // Set entire IP list (e.g., from API)
      setIps: (ips) => set({ ips: Array.from(new Set(ips)) }),

      // Add a unique IP
      addIp: (newIp) =>
        set((state) => {
          if (state.ips.includes(newIp)) return state;
          return { ips: [...state.ips, newIp] };
        }),

      // Remove an IP
      removeIp: (ipToRemove) =>
        set((state) => ({
          ips: state.ips.filter((ip) => ip !== ipToRemove),
        })),

      // Clear all IPs
      clearIps: () => set({ ips: [] }),
    }),
    {
      name: 'ip-storage', // Key for localStorage
    }
);
