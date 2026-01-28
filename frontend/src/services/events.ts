import { EventsOn } from "@wailsjs/runtime/runtime";
import type { Message, Contact, Settings, ConnectionState } from "../types";

// Event name constants — must match events.go
export const Events = {
  AppReady: "app:ready",
  AppError: "app:error",
  MessageReceived: "message:received",
  MessageStatus: "message:status",
  ContactStatus: "contact:status",
  ContactTyping: "contact:typing",
  ContactUpdated: "contact:updated",
  ConnectionState: "connection:state",
  SettingsChanged: "settings:changed",
} as const;

// Payload interfaces

export interface MessageStatusPayload {
  messageID: string;
  chatID: string;
  status: string;
}

export interface ContactStatusPayload {
  contactID: string;
  isOnline: boolean;
  lastSeen: number;
}

export interface ContactTypingPayload {
  contactID: string;
  isTyping: boolean;
}

// Typed event subscription helpers — each returns a cleanup function

export function onMessageReceived(cb: (message: Message) => void): () => void {
  return EventsOn(Events.MessageReceived, cb);
}

export function onMessageStatus(
  cb: (payload: MessageStatusPayload) => void,
): () => void {
  return EventsOn(Events.MessageStatus, cb);
}

export function onContactStatus(
  cb: (payload: ContactStatusPayload) => void,
): () => void {
  return EventsOn(Events.ContactStatus, cb);
}

export function onContactTyping(
  cb: (payload: ContactTypingPayload) => void,
): () => void {
  return EventsOn(Events.ContactTyping, cb);
}

export function onContactUpdated(cb: (contact: Contact) => void): () => void {
  return EventsOn(Events.ContactUpdated, cb);
}

export function onConnectionState(
  cb: (state: ConnectionState) => void,
): () => void {
  return EventsOn(Events.ConnectionState, cb);
}

export function onSettingsChanged(
  cb: (settings: Settings) => void,
): () => void {
  return EventsOn(Events.SettingsChanged, cb);
}

export function onAppReady(cb: () => void): () => void {
  return EventsOn(Events.AppReady, cb);
}

export function onAppError(cb: (error: string) => void): () => void {
  return EventsOn(Events.AppError, cb);
}
