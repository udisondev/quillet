// Plain data interface matching domain.Contact shape.
export interface Contact {
  publicID: string;
  publicKey: string;
  displayName: string;
  avatarPath: string;
  isOnline: boolean;
  isBlocked: boolean;
  lastSeen: number;
  addedAt: number;
}
