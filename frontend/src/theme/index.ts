import { createTheme, type Theme } from "@mui/material/styles";
import { lightPalette, lightCustomColors } from "./light";
import { darkPalette, darkCustomColors } from "./dark";
import { typography } from "./typography";
import { components } from "./components";

export { spacing, radius, shadows, animations, layout } from "./tokens";
export { lightCustomColors } from "./light";
export { darkCustomColors } from "./dark";

export interface CustomColors {
  primarySurface: string;
  messageOwn: string;
  messageOther: string;
}

declare module "@mui/material/styles" {
  interface Theme {
    custom: CustomColors;
  }
  interface ThemeOptions {
    custom?: CustomColors;
  }
}

export const lightTheme: Theme = createTheme({
  palette: lightPalette,
  typography,
  components,
  custom: lightCustomColors,
});

export const darkTheme: Theme = createTheme({
  palette: darkPalette,
  typography,
  components,
  custom: darkCustomColors,
});

export function getTheme(mode: "light" | "dark"): Theme {
  return mode === "light" ? lightTheme : darkTheme;
}
