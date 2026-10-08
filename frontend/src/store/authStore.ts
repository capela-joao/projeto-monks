// src/store/authStore.ts
import { create } from 'zustand'

interface AuthState {
  loggedLeaderId: number | null;
  setLoggedLeader: (id: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loggedLeaderId: null,
  setLoggedLeader: (id) => set({ loggedLeaderId: id }),
  logout: () => set({ loggedLeaderId: null }),
}));