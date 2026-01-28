import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import { useMessagesStore } from "../../store/useMessagesStore";
import { useUIStore } from "../../store/useUIStore";
import { useIdentityStore } from "../../store/useIdentityStore";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { sendMessage } from "../../services/api";
import { MessageStatus } from "../../types/message";

interface MessageInputProps {
  chatID: string;
}

export function MessageInput({ chatID }: MessageInputProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useMessagesStore((s) => s.addMessage);
  const replaceMessage = useMessagesStore((s) => s.replaceMessage);
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus);
  const updateSummary = useChatSummariesStore((s) => s.updateSummary);
  const myID = useIdentityStore((s) => s.identity?.publicID ?? "");

  // Load draft on mount
  useEffect(() => {
    const draft = useUIStore.getState().drafts[chatID] ?? "";
    setText(draft);
    inputRef.current?.focus();
  }, [chatID]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || sending) return;

    const tempID = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempID,
      chatID,
      senderID: myID,
      content,
      timestamp: Date.now(),
      status: MessageStatus.Sending,
    };

    setText("");
    useUIStore.getState().setDraft(chatID, "");
    setSending(true);

    // Optimistic: add temp message immediately
    addMessage(chatID, tempMessage);
    updateSummary(chatID, { lastMessage: tempMessage });

    try {
      const message = await sendMessage(chatID, content);
      replaceMessage(chatID, tempID, message);
      updateSummary(chatID, { lastMessage: message });
    } catch (err) {
      console.error("send message:", err);
      updateMessageStatus(chatID, tempID, MessageStatus.Failed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [text, sending, chatID, myID, addMessage, replaceMessage, updateMessageStatus, updateSummary]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1,
        px: 2,
        py: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <TextField
        inputRef={inputRef}
        multiline
        maxRows={5}
        fullWidth
        placeholder="Write a message..."
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          setText(value);
          useUIStore.getState().setDraft(chatID, value);
        }}
        onKeyDown={handleKeyDown}
        size="small"
        slotProps={{
          htmlInput: { maxLength: 4096 },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!canSend}
        sx={{ mb: 0.25 }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
