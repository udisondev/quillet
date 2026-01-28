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
import { useUIStore } from "../store/useUIStore";
import { markAsRead, notifyReady } from "../services/api";
import type { Message, Settings, ConnectionState } from "../types";

export function useEventSubscriptions() {
  const addMessage = useMessagesStore((s) => s.addMessage);
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus);
  const setTyping = useMessagesStore((s) => s.setTyping);
  const updateSummary = useChatSummariesStore((s) => s.updateSummary);
  const updateUnreadCount = useChatSummariesStore((s) => s.updateUnreadCount);
  const updateContactInSummaries = useChatSummariesStore(
    (s) => s.updateContactInSummaries,
  );
  const updateContactStatus = useContactsStore((s) => s.updateContactStatus);
  const setConnectionState = useConnectionStore((s) => s.setState);
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    const cleanups = [
      onMessageReceived((message: Message) => {
        addMessage(message.chatID, message);
        updateSummary(message.chatID, { lastMessage: message });

        // Gap 5: auto mark-as-read when the chat is currently active
        const activeChatID = useUIStore.getState().activeChatID;
        if (activeChatID === message.chatID) {
          markAsRead(message.chatID).catch((err) =>
            console.error("auto markAsRead:", err),
          );
          return;
        }

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
        // Gap 3: pass lastSeen to contacts store
        updateContactStatus(
          payload.contactID,
          payload.isOnline,
          payload.lastSeen,
        );
        // Gap 4: sync status into chat summaries
        updateContactInSummaries(
          payload.contactID,
          payload.isOnline,
          payload.lastSeen,
        );
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

    // Signal backend that event listeners are ready
    notifyReady().catch((err) =>
      console.error("notifyReady:", err),
    );

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
    updateContactInSummaries,
    updateContactStatus,
    setConnectionState,
    setSettings,
  ]);
}
