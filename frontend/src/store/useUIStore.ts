import { create } from "zustand";

interface UIState {
  activeChatID: string | null;
  searchQuery: string;
  addContactDialogOpen: boolean;
  settingsOpen: boolean;
  drafts: Record<string, string>;
  setActiveChatID: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setAddContactDialogOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setDraft: (chatID: string, text: string) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeChatID: null,
  searchQuery: "",
  addContactDialogOpen: false,
  settingsOpen: false,
  drafts: {},
  setActiveChatID: (id) => set({ activeChatID: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setAddContactDialogOpen: (open) => set({ addContactDialogOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setDraft: (chatID, text) =>
    set((state) => {
      const drafts = { ...state.drafts };
      if (text) {
        drafts[chatID] = text;
      } else {
        delete drafts[chatID];
      }
      return { drafts };
    }),
}));
