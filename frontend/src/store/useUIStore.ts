import { create } from "zustand";

interface UIState {
  activeChatID: string | null;
  searchQuery: string;
  addContactDialogOpen: boolean;
  settingsOpen: boolean;
  setActiveChatID: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setAddContactDialogOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeChatID: null,
  searchQuery: "",
  addContactDialogOpen: false,
  settingsOpen: false,
  setActiveChatID: (id) => set({ activeChatID: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAddContactDialogOpen: (open) => set({ addContactDialogOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}));
