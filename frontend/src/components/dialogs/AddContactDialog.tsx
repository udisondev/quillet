import { useState, useCallback, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { isValidContactInput, extractPublicID } from "../../utils/validation";
import { addContact } from "../../services/api";
import { useContactsStore } from "../../store/useContactsStore";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { useIdentityStore } from "../../store/useIdentityStore";
import { useUIStore } from "../../store/useUIStore";
import { useToastStore } from "../../store/useToastStore";

const DISPLAY_NAME_MAX_LENGTH = 64;

export function AddContactDialog() {
  const open = useUIStore((s) => s.addContactDialogOpen);
  const setOpen = useUIStore((s) => s.setAddContactDialogOpen);
  const setActiveChatID = useUIStore((s) => s.setActiveChatID);

  const contacts = useContactsStore((s) => s.contacts);
  const addContactToStore = useContactsStore((s) => s.addContact);

  const addSummary = useChatSummariesStore((s) => s.addSummary);

  const identity = useIdentityStore((s) => s.identity);

  const showToast = useToastStore((s) => s.showToast);

  const [publicIDInput, setPublicIDInput] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const trimmedInput = publicIDInput.replace(/\s/g, "");

  const validationError = useMemo((): string | null => {
    if (!trimmedInput) {
      return touched ? "Public ID is required" : null;
    }
    if (!isValidContactInput(trimmedInput)) {
      return "Invalid format. Enter 16 or 64 hex characters";
    }
    const extractedID = extractPublicID(trimmedInput);
    if (identity && extractedID === identity.publicID) {
      return "You cannot add yourself";
    }
    if (contacts.some((c) => c.publicID === extractedID)) {
      return "Contact already exists";
    }
    return null;
  }, [trimmedInput, touched, identity, contacts]);

  const isValid = trimmedInput.length > 0 && validationError === null;

  const handleClose = useCallback(() => {
    if (loading) return;
    setOpen(false);
    setPublicIDInput("");
    setDisplayName("");
    setTouched(false);
  }, [loading, setOpen]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPublicIDInput(text.trim());
      setTouched(true);
    } catch (err) {
      console.error("clipboard read failed:", err);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      const extractedID = extractPublicID(trimmedInput);
      const contact = await addContact(extractedID, displayName.trim());

      addContactToStore(contact);
      addSummary({
        contactID: contact.publicID,
        contact,
        unreadCount: 0,
      });

      setActiveChatID(contact.publicID);
      showToast("Contact added", "success");
      handleClose();
    } catch (err) {
      console.error("add contact failed:", err);
      showToast(String(err), "error");
    } finally {
      setLoading(false);
    }
  }, [
    isValid,
    loading,
    trimmedInput,
    displayName,
    addContactToStore,
    addSummary,
    setActiveChatID,
    showToast,
    handleClose,
  ]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ component: "form", onSubmit: (e: React.FormEvent) => { e.preventDefault(); handleSubmit(); } }}
    >
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
        <TextField
          autoFocus
          label="Public ID"
          placeholder="Enter 16 or 64 hex characters"
          fullWidth
          value={publicIDInput}
          onChange={(e) => {
            setPublicIDInput(e.target.value);
            if (!touched) setTouched(true);
          }}
          onBlur={() => setTouched(true)}
          error={touched && validationError !== null}
          helperText={touched ? validationError : " "}
          disabled={loading}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handlePaste} edge="end" size="small" disabled={loading}>
                    <ContentPasteIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
            htmlInput: {
              spellCheck: false,
              autoComplete: "off",
            },
          }}
          sx={{ mt: 1 }}
        />
        <TextField
          label="Display Name"
          placeholder="Optional"
          fullWidth
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          slotProps={{
            htmlInput: {
              maxLength: DISPLAY_NAME_MAX_LENGTH,
            },
          }}
          helperText={`${displayName.length}/${DISPLAY_NAME_MAX_LENGTH}`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Add Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
}
