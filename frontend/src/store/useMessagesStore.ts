import { create } from "zustand";
import type { Message } from "../types";

interface MessagesState {
  messagesByChat: Record<string, Message[]>;
  loadingChat: string | null;
  typingContacts: Record<string, boolean>;
  setMessages: (chatID: string, messages: Message[]) => void;
  prependMessages: (chatID: string, messages: Message[]) => void;
  addMessage: (chatID: string, message: Message) => void;
  updateMessageStatus: (
    chatID: string,
    messageID: string,
    status: string,
  ) => void;
  replaceMessage: (chatID: string, tempID: string, message: Message) => void;
  setLoadingChat: (chatID: string | null) => void;
  setTyping: (contactID: string, isTyping: boolean) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  messagesByChat: {},
  loadingChat: null,
  typingContacts: {},
  setMessages: (chatID, messages) =>
    set((state) => ({
      messagesByChat: { ...state.messagesByChat, [chatID]: messages },
      loadingChat: null,
    })),
  prependMessages: (chatID, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatID]: [...messages, ...(state.messagesByChat[chatID] ?? [])],
      },
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
  replaceMessage: (chatID, tempID, message) =>
    set((state) => {
      const messages = state.messagesByChat[chatID];
      if (!messages) return state;
      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatID]: messages.map((m) => (m.id === tempID ? message : m)),
        },
      };
    }),
  setLoadingChat: (chatID) => set({ loadingChat: chatID }),
  setTyping: (contactID, isTyping) =>
    set((state) => ({
      typingContacts: { ...state.typingContacts, [contactID]: isTyping },
    })),
}));
