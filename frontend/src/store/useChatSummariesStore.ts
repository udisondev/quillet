import { create } from "zustand";
import type { ChatSummary } from "../types";

interface ChatSummariesState {
  summaries: ChatSummary[];
  setSummaries: (summaries: ChatSummary[]) => void;
  addSummary: (summary: ChatSummary) => void;
  removeSummary: (contactID: string) => void;
  updateSummary: (contactID: string, partial: Partial<ChatSummary>) => void;
  updateUnreadCount: (contactID: string, count: number) => void;
}

export const useChatSummariesStore = create<ChatSummariesState>()((set) => ({
  summaries: [],
  setSummaries: (summaries) => set({ summaries }),
  addSummary: (summary) =>
    set((state) => ({ summaries: [summary, ...state.summaries] })),
  removeSummary: (contactID) =>
    set((state) => ({
      summaries: state.summaries.filter((s) => s.contactID !== contactID),
    })),
  updateSummary: (contactID, partial) =>
    set((state) => ({
      summaries: state.summaries.map((s) =>
        s.contactID === contactID ? { ...s, ...partial } : s,
      ),
    })),
  updateUnreadCount: (contactID, count) =>
    set((state) => ({
      summaries: state.summaries.map((s) =>
        s.contactID === contactID ? { ...s, unreadCount: count } : s,
      ),
    })),
}));
