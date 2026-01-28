// Plain data interface matching domain.User shape.
export interface Identity {
  publicID: string;
  publicKey: string;
  displayName: string;
  avatarPath: string;
  createdAt: number;
}
