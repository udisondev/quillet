import { create } from "zustand";
import type { Message } from "../types";

interface MessagesState {
  messagesByChat: Record<string, Message[]>;
  loadingChat: string | null;
  setMessages: (chatID: string, messages: Message[]) => void;
  addMessage: (chatID: string, message: Message) => void;
  updateMessageStatus: (
    chatID: string,
    messageID: string,
    status: string,
  ) => void;
  setLoadingChat: (chatID: string | null) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  messagesByChat: {},
  loadingChat: null,
  setMessages: (chatID, messages) =>
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatID]: messages },
      loadingChat: null,
    })),
  addMessage: (chatID, message) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatID]: [...(state.messagesByChat[chatID] ?? []), message],
      },
    })),
  updateMessageStatus: (chatID, messageID, status) =>
    set((state) => {
      const messages = state.messagesByChat[chatID];
      if (!messages) return state;
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatID]: messages.map((m) =>
            m.id === messageID ? { ...m, status } : m,
          ),
        },
      };
    }),
  setLoadingChat: (chatID) => set({ loadingChat: chatID }),
}));
