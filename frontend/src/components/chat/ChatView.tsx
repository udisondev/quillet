import Box from "@mui/material/Box";
import { useContactsStore } from "../../store/useContactsStore";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { ChatHeader } from "./ChatHeader";
import { ConnectionStatusBar } from "./ConnectionStatusBar";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

interface ChatViewProps {
  chatID: string;
}

export function ChatView({ chatID }: ChatViewProps) {
  const contact =
    useContactsStore((s) => s.contacts.find((c) => c.publicID === chatID)) ??
    useChatSummariesStore((s) =>
      s.summaries.find((s) => s.contactID === chatID),
    )?.contact;

  if (!contact) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <ChatHeader contact={contact} />
      <ConnectionStatusBar />
      <MessageList chatID={chatID} />
      <MessageInput chatID={chatID} />
    </Box>
  );
}
