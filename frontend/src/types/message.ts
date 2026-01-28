// Plain data interface matching domain.Message shape.
export interface Message {
  id: string;
  chatID: string;
  senderID: string;
  content: string;
  timestamp: number;
  status: string;
}

export const MessageStatus = {
  Sending: "sending",
  Sent: "sent",
  Delivered: "delivered",
  Read: "read",
  Failed: "failed",
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];
