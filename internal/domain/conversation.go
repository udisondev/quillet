package domain

// ChatSummary represents a conversation preview shown in the sidebar.
type ChatSummary struct {
	ContactID   string   `json:"contactID"`
	Contact     Contact  `json:"contact"`
	LastMessage *Message `json:"lastMessage"`
	UnreadCount int      `json:"unreadCount"`
}
