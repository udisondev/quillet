import {
  GetIdentity,
  UpdateProfile,
  GetContacts,
  AddContact,
  DeleteContact,
  BlockContact,
  UnblockContact,
  GetChatSummaries,
  SendMessage,
  GetMessages,
  MarkAsRead,
  ClearHistory,
  GetSettings,
  UpdateSettings,
  NotifyReady,
} from "@wailsjs/go/main/App";
import { domain } from "@wailsjs/go/models";
import type { Identity } from "../types/identity";
import type { Contact } from "../types/contact";
import type { Message } from "../types/message";
import type { ChatSummary } from "../types/chat";
import type { Settings } from "../types/settings";

// Identity

export function getIdentity(): Promise<Identity> {
  return GetIdentity();
}

export function updateProfile(displayName: string): Promise<void> {
  return UpdateProfile(displayName);
}

// Contacts

export function getContacts(): Promise<Contact[]> {
  return GetContacts();
}

export function addContact(
  publicID: string,
  displayName: string,
): Promise<Contact> {
  return AddContact(publicID, displayName);
}

export function deleteContact(publicID: string): Promise<void> {
  return DeleteContact(publicID);
}

export function blockContact(publicID: string): Promise<void> {
  return BlockContact(publicID);
}

export function unblockContact(publicID: string): Promise<void> {
  return UnblockContact(publicID);
}

// Messaging

export function getChatSummaries(): Promise<ChatSummary[]> {
  return GetChatSummaries();
}

export function sendMessage(
  contactID: string,
  content: string,
): Promise<Message> {
  return SendMessage(contactID, content);
}

export function getMessages(
  contactID: string,
  limit: number,
  beforeID: string,
): Promise<Message[]> {
  return GetMessages(contactID, limit, beforeID);
}

export function markAsRead(contactID: string): Promise<void> {
  return MarkAsRead(contactID);
}

export function clearHistory(contactID: string): Promise<void> {
  return ClearHistory(contactID);
}

// Settings

export function getSettings(): Promise<Settings> {
  return GetSettings();
}

export function updateSettings(settings: Settings): Promise<void> {
  return UpdateSettings(new domain.Settings(settings));
}

// Lifecycle

export function notifyReady(): Promise<void> {
  return NotifyReady();
}
