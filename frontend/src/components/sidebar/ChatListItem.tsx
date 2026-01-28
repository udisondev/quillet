import { useState, useCallback } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BlockIcon from "@mui/icons-material/Block";
import { Avatar } from "../ui/Avatar";
import { ContextMenu } from "../ui/ContextMenu";
import type { ContextMenuItem } from "../ui/ContextMenu";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { layout } from "../../theme";
import { deleteContact, blockContact } from "../../services/api";
import { useContactsStore } from "../../store/useContactsStore";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { useUIStore } from "../../store/useUIStore";
import { useToastStore } from "../../store/useToastStore";
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

type ConfirmAction = "delete" | "block" | null;

export function ChatListItem({ summary, selected, onClick }: ChatListItemProps) {
  const { contact, lastMessage, unreadCount } = summary;

  const removeContact = useContactsStore((s) => s.removeContact);
  const removeSummary = useChatSummariesStore((s) => s.removeSummary);
  const activeChatID = useUIStore((s) => s.activeChatID);
  const setActiveChatID = useUIStore((s) => s.setActiveChatID);
  const showToast = useToastStore((s) => s.showToast);
  const draft = useUIStore((s) => s.drafts[summary.contactID]);

  // Состояние контекстного меню
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuPosition(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;
    setConfirmLoading(true);

    try {
      if (confirmAction === "delete") {
        await deleteContact(contact.publicID);
        showToast("Chat deleted", "success");
      } else {
        await blockContact(contact.publicID);
        showToast("Contact blocked", "success");
      }

      removeContact(contact.publicID);
      removeSummary(contact.publicID);

      // Сбрасываем активный чат если удалили/заблокировали текущий
      if (activeChatID === contact.publicID) {
        setActiveChatID(null);
      }
    } catch (err) {
      console.error(`${confirmAction} contact failed:`, err);
      showToast(String(err), "error");
    } finally {
      setConfirmLoading(false);
      setConfirmAction(null);
    }
  }, [
    confirmAction,
    contact.publicID,
    removeContact,
    removeSummary,
    activeChatID,
    setActiveChatID,
    showToast,
  ]);

  const menuItems: ContextMenuItem[] = [
    {
      label: "Delete chat",
      icon: <DeleteOutlineIcon fontSize="small" />,
      danger: true,
      onClick: () => setConfirmAction("delete"),
    },
    {
      label: "Block contact",
      icon: <BlockIcon fontSize="small" />,
      danger: true,
      divider: true,
      onClick: () => setConfirmAction("block"),
    },
  ];

  const confirmConfig = confirmAction === "delete"
    ? {
        title: "Delete chat",
        message: `Are you sure you want to delete the chat with ${contact.displayName}? This action cannot be undone.`,
        confirmLabel: "Delete",
      }
    : {
        title: "Block contact",
        message: `Are you sure you want to block ${contact.displayName}? They will no longer be able to send you messages.`,
        confirmLabel: "Block",
      };

  return (
    <>
      <ListItemButton
        selected={selected}
        onClick={onClick}
        onContextMenu={handleContextMenu}
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
                component="span"
                sx={{ flex: 1 }}
              >
                {draft ? (
                  <>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ color: "error.main", fontWeight: 500 }}
                    >
                      Draft:
                    </Typography>
                    {" "}{draft}
                  </>
                ) : (
                  lastMessage?.content ?? "No messages yet"
                )}
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

      <ContextMenu
        open={menuPosition !== null}
        position={menuPosition ?? { top: 0, left: 0 }}
        items={menuItems}
        onClose={handleCloseMenu}
      />

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        confirmColor="error"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
        loading={confirmLoading}
      />
    </>
  );
}
