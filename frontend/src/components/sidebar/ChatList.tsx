import { useMemo } from "react";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { ChatListItem } from "./ChatListItem";
import { EmptyState } from "../ui/EmptyState";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { useUIStore } from "../../store/useUIStore";

export function ChatList() {
  const summaries = useChatSummariesStore((s) => s.summaries);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const activeChatID = useUIStore((s) => s.activeChatID);
  const setActiveChatID = useUIStore((s) => s.setActiveChatID);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return summaries;
    const q = searchQuery.toLowerCase();
    return summaries.filter((s) =>
      s.contact.displayName.toLowerCase().includes(q),
    );
  }, [summaries, searchQuery]);

  if (summaries.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <EmptyState variant="no-chats" />
      </Box>
    );
  }

  if (filtered.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <EmptyState variant="no-search-results" />
      </Box>
    );
  }

  return (
    <List sx={{ flex: 1, overflow: "auto", py: 0.5 }}>
      {filtered.map((summary) => (
        <ChatListItem
          key={summary.contactID}
          summary={summary}
          selected={activeChatID === summary.contactID}
          onClick={() => setActiveChatID(summary.contactID)}
        />
      ))}
    </List>
  );
}
