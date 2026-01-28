import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF",
    },
    secondary: {
      main: "#FF6584",
    },
    background: {
      default: "#1B2636",
      paper: "#243447",
    },
  },
});

export default theme;
