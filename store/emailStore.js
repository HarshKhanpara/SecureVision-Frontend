import { create } from 'zustand';

export const useEmailStore = create(set => ({
  email: '',
  setEmail: (email) => set({ email }),
}));



// import { useEmailStore } from '@/store/emailStore';

// const email = useEmailStore(state => state.email);
// const setEmail = useEmailStore(state => state.setEmail);
