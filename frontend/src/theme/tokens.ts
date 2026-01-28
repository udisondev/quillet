export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  light: {
    sm: "0 1px 3px rgba(0,0,0,0.08)",
    md: "0 4px 12px rgba(0,0,0,0.12)",
    lg: "0 8px 24px rgba(0,0,0,0.16)",
  },
  dark: {
    sm: "0 1px 3px rgba(0,0,0,0.20)",
    md: "0 4px 12px rgba(0,0,0,0.30)",
    lg: "0 8px 24px rgba(0,0,0,0.40)",
  },
} as const;

export const animations = {
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  spring: "400ms",
} as const;

export const layout = {
  titleBarHeight: 32,
  sidebarWidth: 320,
  profileHeaderHeight: 64,
  searchBarHeight: 48,
  chatListItemHeight: 72,
  fabSize: 48,
} as const;
