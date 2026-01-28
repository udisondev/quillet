import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import SyncIcon from "@mui/icons-material/Sync";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import { keyframes } from "@mui/material/styles";
import { useConnectionStore } from "../../store/useConnectionStore";
import { ConnectionState } from "../../types";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export function ConnectionStatusBar() {
  const connectionState = useConnectionStore((s) => s.state);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
    // connecting or disconnected — always visible
    setVisible(true);
  }, [connectionState]);

  const config = {
    [ConnectionState.Connecting]: {
      color: "warning.main",
      bgcolor: "warning.light",
      icon: (
        <SyncIcon
          sx={{ fontSize: 18, animation: `${spin} 2s linear infinite` }}
        />
      ),
      text: "Connecting...",
    },
    [ConnectionState.Disconnected]: {
      color: "error.main",
      bgcolor: "error.light",
      icon: <CloudOffIcon sx={{ fontSize: 18 }} />,
      text: "Disconnected",
      action: true,
    },
    [ConnectionState.Connected]: {
      color: "success.main",
      bgcolor: "success.light",
      icon: <CloudDoneIcon sx={{ fontSize: 18 }} />,
      text: "Connected",
    },
  } as const;

  const current = config[connectionState];

  return (
    <Collapse in={visible}>
      <Box
        sx={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          bgcolor: current.bgcolor,
          color: current.color,
        }}
      >
        {current.icon}
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {current.text}
        </Typography>
        {"action" in current && current.action && (
          <Button
            size="small"
            variant="text"
            sx={{
              minWidth: "auto",
              color: "inherit",
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        )}
      </Box>
    </Collapse>
  );
}
