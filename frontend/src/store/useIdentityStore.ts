import { create } from "zustand";
import type { Identity } from "../types";

interface IdentityState {
  identity: Identity | null;
  setIdentity: (identity: Identity) => void;
  updateDisplayName: (name: string) => void;
}

export const useIdentityStore = create<IdentityState>()((set) => ({
  identity: null,
  setIdentity: (identity) => set({ identity }),
  updateDisplayName: (name) =>
    set((state) => {
      if (!state.identity) return state;
      return {
        identity: { ...state.identity, displayName: name },
      };
    }),
}));
