import Fab from "@mui/material/Fab";
import Badge from "@mui/material/Badge";
import Zoom from "@mui/material/Zoom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface ScrollToBottomFABProps {
  visible: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export function ScrollToBottomFAB({
  visible,
  unreadCount,
  onClick,
}: ScrollToBottomFABProps) {
  return (
    <Zoom in={visible}>
      <Badge
        badgeContent={unreadCount}
        color="primary"
        invisible={!unreadCount || unreadCount <= 0}
        sx={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1,
        }}
      >
        <Fab size="small" onClick={onClick} color="default">
          <KeyboardArrowDownIcon />
        </Fab>
      </Badge>
    </Zoom>
  );
}
