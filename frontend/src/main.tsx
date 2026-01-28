import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { AppThemeProvider } from "./theme/ThemeProvider";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("root element not found");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
