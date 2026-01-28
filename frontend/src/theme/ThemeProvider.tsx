import { useMemo, useEffect, useState } from "react";
import { ThemeProvider, type Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { getTheme } from "./index";
import { useSettingsStore } from "../store/useSettingsStore";
import type { ThemeMode } from "../types/settings";

function useSystemTheme(): "light" | "dark" {
  const [system, setSystem] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystem(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return system;
}

function resolveMode(
  setting: ThemeMode | undefined,
  system: "light" | "dark",
): "light" | "dark" {
  if (setting === "light" || setting === "dark") return setting;
  return system;
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const themeSetting = useSettingsStore(
    (s) => s.settings?.theme as ThemeMode | undefined,
  );
  const systemTheme = useSystemTheme();
  const mode = resolveMode(themeSetting, systemTheme);

  const theme: Theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
