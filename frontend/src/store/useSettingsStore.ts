import { create } from "zustand";
import type { Settings, ThemeMode } from "../types";

interface SettingsState {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  setTheme: (theme) =>
    set((state) => {
      if (!state.settings) return state;
      return { settings: { ...state.settings, theme } };
    }),
}));
