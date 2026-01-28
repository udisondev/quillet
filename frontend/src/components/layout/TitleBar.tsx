import Box from "@mui/material/Box";
import { layout } from "../../theme";

export function TitleBar() {
  return (
    <Box
      sx={{
        height: layout.titleBarHeight,
        width: "100%",
        flexShrink: 0,
        "--wails-draggable": "drag",
        WebkitAppRegion: "drag",
        pl: "70px", // macOS traffic lights spacing
      }}
    />
  );
}
