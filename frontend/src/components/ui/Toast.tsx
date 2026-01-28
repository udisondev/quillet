import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useToastStore } from "../../store/useToastStore";

export function Toast() {
  const open = useToastStore((s) => s.open);
  const message = useToastStore((s) => s.message);
  const severity = useToastStore((s) => s.severity);
  const hideToast = useToastStore((s) => s.hideToast);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={hideToast}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={hideToast}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
