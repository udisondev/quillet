import MuiAvatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

const AVATAR_COLORS = [
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#009688",
  "#FF5722",
  "#795548",
  "#607D8B",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  return AVATAR_COLORS[hashCode(name) % AVATAR_COLORS.length];
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: 32 | 40 | 48 | 80;
  online?: boolean;
}

export function Avatar({ name, src, size = 40, online }: AvatarProps) {
  const avatar = (
    <MuiAvatar
      src={src}
      sx={{
        width: size,
        height: size,
        bgcolor: src ? undefined : getColor(name),
        fontSize: size * 0.4,
        fontWeight: 600,
      }}
    >
      {!src && getInitials(name)}
    </MuiAvatar>
  );

  if (online === undefined) return avatar;

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      variant="dot"
      sx={{
        "& .MuiBadge-badge": {
          width: 10,
          height: 10,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: "background.paper",
          bgcolor: online ? "success.main" : "action.disabled",
        },
      }}
    >
      {avatar}
    </Badge>
  );
}
