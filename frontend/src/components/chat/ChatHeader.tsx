import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import BlockIcon from "@mui/icons-material/Block";
import { keyframes } from "@mui/material/styles";
import type { Contact } from "../../types/contact";
import { Avatar } from "../ui/Avatar";
import { layout } from "../../theme/tokens";
import { useMessagesStore } from "../../store/useMessagesStore";
import { clearHistory, blockContact } from "../../services/api";

const ellipsis = keyframes`
  0% { content: ""; }
  25% { content: "."; }
  50% { content: ".."; }
  75% { content: "..."; }
`;

function formatLastSeen(contact: Contact): string {
  if (contact.isOnline) return "Online";
  if (!contact.lastSeen) return "";

  const now = Date.now();
  const diff = now - contact.lastSeen;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;

  const date = new Date(contact.lastSeen);
  const days = Math.floor(diff / 86400000);
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (days < 7) {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${weekday} at ${time}`;
  }

  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${formatted} at ${time}`;
}

interface ChatHeaderProps {
  contact: Contact;
}

export function ChatHeader({ contact }: ChatHeaderProps) {
  const isTyping = useMessagesStore(
    (s) => s.typingContacts[contact.publicID] ?? false,
  );
  const setMessages = useMessagesStore((s) => s.setMessages);

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  let statusText: string;
  let statusColor: string;

  if (isTyping) {
    statusText = "typing";
    statusColor = "primary.main";
  } else if (contact.isOnline) {
    statusText = formatLastSeen(contact);
    statusColor = "success.main";
  } else {
    statusText = formatLastSeen(contact);
    statusColor = "text.secondary";
  }

  const handleClearHistory = async () => {
    setMenuAnchor(null);
    try {
      await clearHistory(contact.publicID);
      setMessages(contact.publicID, []);
    } catch (err) {
      console.error("clear history:", err);
    }
  };

  const handleBlockContact = async () => {
    setMenuAnchor(null);
    try {
      await blockContact(contact.publicID);
    } catch (err) {
      console.error("block contact:", err);
    }
  };

  return (
    <Box
      sx={{
        height: layout.chatHeaderHeight,
        minHeight: layout.chatHeaderHeight,
        display: "flex",
        alignItems: "center",
        px: 2,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Avatar
        name={contact.displayName}
        src={contact.avatarPath || undefined}
        size={40}
        online={contact.isOnline}
      />
      <Box sx={{ ml: 1.5, minWidth: 0, flex: 1 }}>
        <Typography
          variant="h3"
          noWrap
          sx={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3 }}
        >
          {contact.displayName}
        </Typography>
        {statusText && (
          <Typography
            variant="caption"
            sx={{
              color: statusColor,
              lineHeight: 1.2,
              ...(isTyping && {
                "&::after": {
                  content: '""',
                  animation: `${ellipsis} 1.2s steps(4, end) infinite`,
                },
              }),
            }}
          >
            {statusText}
          </Typography>
        )}
      </Box>
      <IconButton
        size="small"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleClearHistory}>
          <ListItemIcon>
            <DeleteSweepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Clear history</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleBlockContact}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block contact</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
