import type { Contact } from "./contact";
import type { Message } from "./message";

// Plain data interface matching domain.ChatSummary shape.
// Used in stores instead of the Wails class to allow spread operations.
export interface ChatSummary {
  contactID: string;
  contact: Contact;
  lastMessage?: Message;
  unreadCount: number;
}
