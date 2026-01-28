import Box from "@mui/material/Box";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "../sidebar/Sidebar";
import { ContentArea } from "./ContentArea";

export function MainLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <TitleBar />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <ContentArea />
      </Box>
    </Box>
  );
}
