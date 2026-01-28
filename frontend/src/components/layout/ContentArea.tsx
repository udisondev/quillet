import Box from "@mui/material/Box";
import { EmptyState } from "../ui/EmptyState";
import { ChatView } from "../chat/ChatView";
import { useUIStore } from "../../store/useUIStore";

export function ContentArea() {
  const activeChatID = useUIStore((s) => s.activeChatID);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      {activeChatID ? (
        <ChatView key={activeChatID} chatID={activeChatID} />
      ) : (
        <EmptyState variant="no-chat-selected" />
      )}
    </Box>
  );
}
