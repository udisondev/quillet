import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import { Avatar } from "../ui/Avatar";
import { layout } from "../../theme";
import type { ChatSummary } from "../../types";

function formatTime(ts: number): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

interface ChatListItemProps {
  summary: ChatSummary;
  selected: boolean;
  onClick: () => void;
}

export function ChatListItem({ summary, selected, onClick }: ChatListItemProps) {
  const { contact, lastMessage, unreadCount } = summary;

  return (
    <ListItemButton
      selected={selected}
      onClick={onClick}
      sx={{
        height: layout.chatListItemHeight,
        px: 1.5,
        mx: 0.5,
        "&.Mui-selected": {
          bgcolor: "custom.primarySurface",
          "&:hover": {
            bgcolor: "custom.primarySurface",
          },
        },
      }}
    >
      <ListItemAvatar sx={{ minWidth: 52 }}>
        <Avatar
          name={contact.displayName}
          size={40}
          online={contact.isOnline}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h3" noWrap sx={{ flex: 1 }}>
              {contact.displayName}
            </Typography>
            {lastMessage && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                {formatTime(lastMessage.timestamp)}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ flex: 1 }}
            >
              {lastMessage?.content ?? "No messages yet"}
            </Typography>
            {unreadCount > 0 && (
              <Badge
                badgeContent={unreadCount}
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        secondaryTypographyProps={{ component: "div" }}
        primaryTypographyProps={{ component: "div" }}
      />
    </ListItemButton>
  );
}
