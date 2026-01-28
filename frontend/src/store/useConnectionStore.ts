import { create } from "zustand";
import type { ConnectionState } from "../types";

interface ConnectionStoreState {
  state: ConnectionState;
  setState: (state: ConnectionState) => void;
}

export const useConnectionStore = create<ConnectionStoreState>()((set) => ({
  state: "connecting",
  setState: (state) => set({ state }),
}));
