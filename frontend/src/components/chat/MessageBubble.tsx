import { useState, type MouseEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTheme, keyframes } from "@mui/material/styles";
import type { Message } from "../../types/message";
import { MessageStatus } from "../../types/message";
import { radius } from "../../theme/tokens";
import { ContextMenu, type ContextMenuItem } from "../ui/ContextMenu";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatusIcon({ status }: { status: string }) {
  const theme = useTheme();
  const iconSx = { fontSize: 14, ml: 0.5 };

  switch (status) {
    case MessageStatus.Sending:
      return (
        <ScheduleIcon
          sx={{
            ...iconSx,
            color: "text.secondary",
            animation: `${spin} 2s linear infinite`,
          }}
        />
      );
    case MessageStatus.Sent:
      return <DoneIcon sx={{ ...iconSx, color: "text.secondary" }} />;
    case MessageStatus.Delivered:
      return <DoneAllIcon sx={{ ...iconSx, color: "text.secondary" }} />;
    case MessageStatus.Read:
      return (
        <DoneAllIcon sx={{ ...iconSx, color: theme.palette.primary.main }} />
      );
    case MessageStatus.Failed:
      return <ErrorOutlineIcon sx={{ ...iconSx, color: "error.main" }} />;
    default:
      return null;
  }
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTail: boolean;
  onRetry?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showTail,
  onRetry,
  onDelete,
}: MessageBubbleProps) {
  const theme = useTheme();
  const [contextMenu, setContextMenu] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const bgColor = isOwn ? theme.custom.messageOwn : theme.custom.messageOther;
  const isFailed = message.status === MessageStatus.Failed;

  const tailRadius = radius.xs;
  const mainRadius = radius.lg;

  const borderRadius = isOwn
    ? `${mainRadius}px ${mainRadius}px ${mainRadius}px ${showTail ? tailRadius : mainRadius}px`
    : `${mainRadius}px ${mainRadius}px ${showTail ? tailRadius : mainRadius}px ${mainRadius}px`;

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ top: e.clientY, left: e.clientX });
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: "Copy text",
      icon: <ContentCopyIcon fontSize="small" />,
      onClick: () => navigator.clipboard.writeText(message.content),
    },
    {
      label: "Delete",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: () => onDelete?.(message),
      danger: true,
      divider: true,
    },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          px: 2,
          mt: showTail ? 1 : 0.5,
        }}
      >
        <Box
          onContextMenu={handleContextMenu}
          onClick={isFailed ? () => onRetry?.(message) : undefined}
          sx={{
            maxWidth: "65%",
            minWidth: 80,
            bgcolor: bgColor,
            borderRadius,
            px: 1.5,
            py: 1,
            position: "relative",
            cursor: isFailed ? "pointer" : undefined,
            boxShadow:
              theme.palette.mode === "light"
                ? "0 1px 2px rgba(0,0,0,0.08)"
                : "0 1px 2px rgba(0,0,0,0.2)",
            ...(isFailed && {
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                borderRadius,
                bgcolor: "error.main",
                opacity: 0.08,
                pointerEvents: "none",
              },
            }),
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: "text.primary",
            }}
          >
            {message.content}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              mt: 0.25,
              gap: 0.25,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", lineHeight: 1 }}
            >
              {formatTime(message.timestamp)}
            </Typography>
            {isOwn && <StatusIcon status={message.status} />}
          </Box>
          {isFailed && (
            <Typography
              variant="caption"
              sx={{ color: "error.main", fontSize: "0.7rem", display: "block" }}
            >
              Failed to send. Click to retry.
            </Typography>
          )}
        </Box>
      </Box>
      <ContextMenu
        open={contextMenu !== null}
        position={contextMenu ?? { top: 0, left: 0 }}
        items={contextMenuItems}
        onClose={() => setContextMenu(null)}
      />
    </>
  );
}
