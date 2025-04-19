import { create } from 'zustand';

export const useCctvNameStore = create(set => ({
  cctvName: '',
  setcctvName: (cctvName) => set({ cctvName }),
}));



// import { useEmailStore } from '@/store/emailStore';

// const email = useEmailStore(state => state.email);
// const setEmail = useEmailStore(state => state.setEmail);
