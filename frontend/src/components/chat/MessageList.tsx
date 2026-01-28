import { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { keyframes } from "@mui/material/styles";
import { useMessagesStore } from "../../store/useMessagesStore";
import { useChatSummariesStore } from "../../store/useChatSummariesStore";
import { useIdentityStore } from "../../store/useIdentityStore";
import { getMessages, markAsRead, sendMessage } from "../../services/api";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollToBottomFAB } from "./ScrollToBottomFAB";
import { EmptyState } from "../ui/EmptyState";
import { MessageStatus } from "../../types/message";
import type { Message } from "../../types/message";

const PAGE_SIZE = 50;
const SCROLL_THRESHOLD = 100;
const EMPTY_MESSAGES: readonly Message[] = [];

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

function isSameDay(a: number, b: number): boolean {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

interface MessageListProps {
  chatID: string;
}

export function MessageList({ chatID }: MessageListProps) {
  const messages = useMessagesStore(
    (s) => s.messagesByChat[chatID] ?? EMPTY_MESSAGES,
  );
  const loadingChat = useMessagesStore((s) => s.loadingChat);
  const setMessages = useMessagesStore((s) => s.setMessages);
  const prependMessages = useMessagesStore((s) => s.prependMessages);
  const setLoadingChat = useMessagesStore((s) => s.setLoadingChat);
  const replaceMessage = useMessagesStore((s) => s.replaceMessage);
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus);
  const updateUnreadCount = useChatSummariesStore((s) => s.updateUnreadCount);
  const isTyping = useMessagesStore(
    (s) => s.typingContacts[chatID] ?? false,
  );
  const myID = useIdentityStore((s) => s.identity?.publicID ?? "");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollFAB, setShowScrollFAB] = useState(false);
  const wasAtBottomRef = useRef(true);
  const prevMessagesLenRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;

  const isLoading = loadingChat === chatID;

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    initialLoadDoneRef.current = false;

    async function load() {
      setLoadingChat(chatID);
      setHasMore(true);
      setShowScrollFAB(false);
      try {
        const msgs = (await getMessages(chatID, PAGE_SIZE, "")) ?? [];
        if (cancelled) return;
        setMessages(chatID, msgs);
        prevMessagesLenRef.current = msgs.length;
        if (msgs.length < PAGE_SIZE) setHasMore(false);

        // Scroll to bottom after initial load
        requestAnimationFrame(() => {
          scrollToBottom();
          wasAtBottomRef.current = true;
          initialLoadDoneRef.current = true;
        });

        // Mark as read
        await markAsRead(chatID);
        if (!cancelled) updateUnreadCount(chatID, 0);
      } catch (err) {
        if (!cancelled) {
          console.error("load messages:", err);
          setLoadingChat(null);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [chatID, setMessages, setLoadingChat, updateUnreadCount, scrollToBottom]);

  // Auto-scroll on new messages (only if was at bottom)
  useEffect(() => {
    if (messages.length > prevMessagesLenRef.current && wasAtBottomRef.current) {
      requestAnimationFrame(scrollToBottom);
    }
    prevMessagesLenRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleScroll = useCallback(async () => {
    const el = scrollRef.current;
    if (!el) return;

    // Track if at bottom
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
    wasAtBottomRef.current = atBottom;
    setShowScrollFAB(!atBottom);

    // Pagination: scroll near top
    const currentMessages = useMessagesStore.getState().messagesByChat[chatID];
    if (
      el.scrollTop < SCROLL_THRESHOLD &&
      hasMoreRef.current &&
      !loadingMoreRef.current &&
      currentMessages &&
      currentMessages.length > 0
    ) {
      setLoadingMore(true);
      loadingMoreRef.current = true;
      const prevScrollHeight = el.scrollHeight;
      const firstMsgID = currentMessages[0].id;

      try {
        const older = (await getMessages(chatID, PAGE_SIZE, firstMsgID)) ?? [];
        if (older.length < PAGE_SIZE) setHasMore(false);
        if (older.length > 0) {
          prependMessages(chatID, older);
          requestAnimationFrame(() => {
            const newScrollHeight = el.scrollHeight;
            el.scrollTop = newScrollHeight - prevScrollHeight;
          });
        }
      } catch (err) {
        console.error("load more messages:", err);
      } finally {
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [chatID, prependMessages]);

  const handleRetry = useCallback(
    async (message: Message) => {
      const tempID = message.id;
      updateMessageStatus(chatID, tempID, MessageStatus.Sending);

      try {
        const real = await sendMessage(chatID, message.content);
        replaceMessage(chatID, tempID, real);
      } catch (err) {
        console.error("retry message:", err);
        updateMessageStatus(chatID, tempID, MessageStatus.Failed);
      }
    },
    [chatID, replaceMessage, updateMessageStatus],
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptyState variant="empty-chat" />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          py: 1,
        }}
      >
        <Box sx={{ maxWidth: 960, mx: "auto", width: "100%" }}>
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {messages.map((msg, idx) => {
            const prev = idx > 0 ? messages[idx - 1] : null;
            const showDate =
              !prev || !isSameDay(prev.timestamp, msg.timestamp);
            const showTail =
              showDate ||
              !prev ||
              prev.senderID !== msg.senderID ||
              msg.timestamp - prev.timestamp > 60000;
            const isOwn = msg.senderID === myID;
            const isNew =
              initialLoadDoneRef.current &&
              idx >= prevMessagesLenRef.current - 1;

            return (
              <Box
                key={msg.id}
                sx={
                  isNew
                    ? {
                        animation: `${isOwn ? slideUp : slideLeft} 200ms ease-out`,
                      }
                    : undefined
                }
              >
                {showDate && <DateSeparator timestamp={msg.timestamp} />}
                <MessageBubble
                  message={msg}
                  isOwn={isOwn}
                  showTail={showTail}
                  onRetry={handleRetry}
                />
              </Box>
            );
          })}
          {isTyping && <TypingIndicator />}
        </Box>
      </Box>
      <ScrollToBottomFAB
        visible={showScrollFAB}
        onClick={scrollToBottom}
      />
    </Box>
  );
}
