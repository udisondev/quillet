import Box from "@mui/material/Box";
import { EmptyState } from "../ui/EmptyState";
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
      {!activeChatID && <EmptyState variant="no-chat-selected" />}
      {/* ChatView will be added in stage 5 */}
    </Box>
  );
}
