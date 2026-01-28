import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

function formatDateLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return "Yesterday";

  const daysDiff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysDiff < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface DateSeparatorProps {
  timestamp: number;
}

export function DateSeparator({ timestamp }: DateSeparatorProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", py: 1.5, px: 2 }}>
      <Divider sx={{ flex: 1 }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, whiteSpace: "nowrap" }}
      >
        {formatDateLabel(timestamp)}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}
