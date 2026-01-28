package domain

// MessageStatus represents the delivery lifecycle of a message.
type MessageStatus string

const (
	StatusSending   MessageStatus = "sending"
	StatusSent      MessageStatus = "sent"
	StatusDelivered MessageStatus = "delivered"
	StatusRead      MessageStatus = "read"
	StatusFailed    MessageStatus = "failed"
)

// Message represents a single chat message.
type Message struct {
	ID        string        `json:"id"`
	ChatID    string        `json:"chatID"`
	SenderID  string        `json:"senderID"`
	Content   string        `json:"content"`
	Timestamp int64         `json:"timestamp"`
	Status    MessageStatus `json:"status"`
}
