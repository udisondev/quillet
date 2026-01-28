import Box from "@mui/material/Box";
import { SidebarHeader } from "./SidebarHeader";
import { SearchBar } from "./SearchBar";
import { ChatList } from "./ChatList";
import { AddContactFAB } from "./AddContactFAB";
import { layout } from "../../theme";

export function Sidebar() {
  return (
    <Box
      sx={{
        width: layout.sidebarWidth,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        position: "relative",
      }}
    >
      <SidebarHeader />
      <SearchBar />
      <ChatList />
      <AddContactFAB />
    </Box>
  );
}
