import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useUIStore } from "../../store/useUIStore";

type EmptyStateVariant =
  | "no-chats"
  | "no-chat-selected"
  | "empty-chat"
  | "no-search-results";

const variants: Record<
  EmptyStateVariant,
  { icon: React.ReactNode; title: string; subtitle: string }
> = {
  "no-chats": {
    icon: <InboxIcon sx={{ fontSize: 64, opacity: 0.4 }} />,
    title: "No chats yet",
    subtitle: "Add a contact to start chatting",
  },
  "no-chat-selected": {
    icon: <ForumOutlinedIcon sx={{ fontSize: 64, opacity: 0.4 }} />,
    title: "Select a chat",
    subtitle: "Choose a conversation from the sidebar",
  },
  "empty-chat": {
    icon: <ChatBubbleOutlineIcon sx={{ fontSize: 64, opacity: 0.4 }} />,
    title: "No messages yet",
    subtitle: "Send the first message to start the conversation",
  },
  "no-search-results": {
    icon: <SearchOffIcon sx={{ fontSize: 64, opacity: 0.4 }} />,
    title: "No results found",
    subtitle: "Try a different search query",
  },
};

interface EmptyStateProps {
  variant: EmptyStateVariant;
}

export function EmptyState({ variant }: EmptyStateProps) {
  const { icon, title, subtitle } = variants[variant];
  const setAddContactDialogOpen = useUIStore(
    (s) => s.setAddContactDialogOpen,
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: 320,
        mx: "auto",
        textAlign: "center",
        gap: 1,
        color: "text.secondary",
      }}
    >
      {icon}
      <Typography variant="h3" color="text.primary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography>
      {variant === "no-chats" && (
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={() => setAddContactDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          Add Contact
        </Button>
      )}
    </Box>
  );
}
