import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Avatar } from "../ui/Avatar";
import { useIdentityStore } from "../../store/useIdentityStore";
import { useUIStore } from "../../store/useUIStore";
import { layout } from "../../theme";

export function SidebarHeader() {
  const identity = useIdentityStore((s) => s.identity);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  return (
    <Box
      sx={{
        height: layout.profileHeaderHeight,
        display: "flex",
        alignItems: "center",
        px: 2,
        gap: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        "--wails-draggable": "drag",
        WebkitAppRegion: "drag",
      }}
    >
      <Avatar
        name={identity?.displayName ?? "User"}
        size={40}
        online
      />
      <Box sx={{ flex: 1, minWidth: 0, WebkitAppRegion: "no-drag" }}>
        <Typography variant="h3" noWrap>
          {identity?.displayName ?? "Loading..."}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Online
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={() => setSettingsOpen(true)}
        sx={{ WebkitAppRegion: "no-drag" }}
      >
        <SettingsOutlinedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
