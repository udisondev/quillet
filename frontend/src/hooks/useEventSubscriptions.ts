import { useEffect } from "react";
import {
  onMessageReceived,
  onMessageStatus,
  onContactStatus,
  onContactTyping,
  onConnectionState,
  onSettingsChanged,
} from "../services/events";
import type {
  MessageStatusPayload,
  ContactStatusPayload,
  ContactTypingPayload,
} from "../services/events";
import { useMessagesStore } from "../store/useMessagesStore";
import { useChatSummariesStore } from "../store/useChatSummariesStore";
import { useContactsStore } from "../store/useContactsStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useSettingsStore } from "../store/useSettingsStore";
import type { Message, Settings, ConnectionState } from "../types";

export function useEventSubscriptions() {
  const addMessage = useMessagesStore((s) => s.addMessage);
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus);
  const setTyping = useMessagesStore((s) => s.setTyping);
  const updateSummary = useChatSummariesStore((s) => s.updateSummary);
  const updateUnreadCount = useChatSummariesStore((s) => s.updateUnreadCount);
  const updateContactStatus = useContactsStore((s) => s.updateContactStatus);
  const setConnectionState = useConnectionStore((s) => s.setState);
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    const cleanups = [
      onMessageReceived((message: Message) => {
        addMessage(message.chatID, message);
        updateSummary(message.chatID, { lastMessage: message });
        updateUnreadCount(
          message.chatID,
          (useChatSummariesStore.getState().summaries.find(
            (s) => s.contactID === message.chatID,
          )?.unreadCount ?? 0) + 1,
        );
      }),

      onMessageStatus((payload: MessageStatusPayload) => {
        updateMessageStatus(payload.chatID, payload.messageID, payload.status);
      }),

      onContactStatus((payload: ContactStatusPayload) => {
        updateContactStatus(payload.contactID, payload.isOnline);
      }),

      onContactTyping((payload: ContactTypingPayload) => {
        setTyping(payload.contactID, payload.isTyping);
      }),

      onConnectionState((state: ConnectionState) => {
        setConnectionState(state);
      }),

      onSettingsChanged((settings: Settings) => {
        setSettings(settings);
      }),
    ];

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [
    addMessage,
    updateMessageStatus,
    setTyping,
    updateSummary,
    updateUnreadCount,
    updateContactStatus,
    setConnectionState,
    setSettings,
  ]);
}
