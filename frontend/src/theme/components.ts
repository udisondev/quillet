import type { Components, Theme } from "@mui/material/styles";
import { radius, animations } from "./tokens";

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        userSelect: "none",
        "& input, & textarea": {
          userSelect: "text",
        },
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: 3,
          background: "rgba(128,128,128,0.3)",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(128,128,128,0.5)",
        },
        "*": {
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 3,
            background: "rgba(128,128,128,0.3)",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(128,128,128,0.5)",
          },
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        boxShadow: "none",
        textTransform: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "filled",
    },
    styleOverrides: {
      root: {
        "& .MuiFilledInput-root": {
          borderRadius: radius.sm,
          "&::before, &::after": {
            display: "none",
          },
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        transition: `background-color ${animations.fast} ease`,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: radius.lg,
      },
    },
  },
};
