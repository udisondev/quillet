import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";

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
    subtitle: "Add a contact to start messaging",
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
    </Box>
  );
}
