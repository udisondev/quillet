import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useUIStore } from "../../store/useUIStore";
import { layout } from "../../theme";

export function AddContactFAB() {
  const setAddContactDialogOpen = useUIStore(
    (s) => s.setAddContactDialogOpen,
  );

  return (
    <Fab
      color="primary"
      size="medium"
      onClick={() => setAddContactDialogOpen(true)}
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
        width: layout.fabSize,
        height: layout.fabSize,
      }}
    >
      <AddIcon />
    </Fab>
  );
}
