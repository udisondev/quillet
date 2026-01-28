// Plain data interface matching domain.Settings shape.
export interface Settings {
  theme: string;
  notificationsOn: boolean;
  soundOn: boolean;
  showMessagePreview: boolean;
  sidebarWidth: number;
}

export const ThemeMode = {
  Light: "light",
  Dark: "dark",
  System: "system",
} as const;

export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];
