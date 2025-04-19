// store/videoStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useVideoStore = create(
  subscribeWithSelector((set) => ({
    videos: [],
    
    // Sets the entire array (like you're doing now)
    setVideos: (videos) => set({ videos }),

    // Optional: helper to add a video immutably
    addVideo: (video) =>
      set((state) => ({
        videos: [...state.videos, video],
      })),

    // Optional: helper to clear videos
    clearVideos: () => set({ videos: [] }),
  }))
);
