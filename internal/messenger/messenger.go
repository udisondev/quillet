package messenger

import (
	"context"

	"quillet/internal/domain"
)

// IdentityProvider manages the local user's profile.
type IdentityProvider interface {
	GetProfile(ctx context.Context) (*domain.User, error)
	UpdateProfile(ctx context.Context, displayName string) error
}

// ContactManager handles the contact list.
type ContactManager interface {
	GetContacts(ctx context.Context) ([]domain.Contact, error)
	AddContact(ctx context.Context, publicID, displayName string) (*domain.Contact, error)
	RemoveContact(ctx context.Context, contactID string) error
	BlockContact(ctx context.Context, contactID string) error
	UnblockContact(ctx context.Context, contactID string) error
}

// ChatService handles conversations and messages.
type ChatService interface {
	GetChatSummaries(ctx context.Context) ([]domain.ChatSummary, error)
	SendMessage(ctx context.Context, contactID, content string) (*domain.Message, error)
	GetMessages(ctx context.Context, contactID string, limit int, beforeID string) ([]domain.Message, error)
	MarkAsRead(ctx context.Context, contactID string) error
	ClearHistory(ctx context.Context, contactID string) error
}

// SettingsManager handles user-configurable preferences.
type SettingsManager interface {
	GetSettings(ctx context.Context) (*domain.Settings, error)
	UpdateSettings(ctx context.Context, settings domain.Settings) error
}

// ContactStatusHandler is called when a contact's online status changes.
type ContactStatusHandler func(contactID string, isOnline bool, lastSeen int64)

// MessageStatusHandler is called when a message delivery status changes.
type MessageStatusHandler func(messageID, chatID string, status domain.MessageStatus)

// TypingHandler is called when a contact starts or stops typing.
type TypingHandler func(contactID string, isTyping bool)

// ConnectionHandler is called when the connection state changes.
type ConnectionHandler func(state string)

// EventSubscriber allows registering callbacks for real-time events.
// Each On* method replaces the previously registered callback.
// Only one handler per event type is supported.
type EventSubscriber interface {
	OnNewMessage(fn func(msg domain.Message))
	OnContactStatusChanged(fn ContactStatusHandler)
	OnMessageStatusChanged(fn MessageStatusHandler)
	OnTypingChanged(fn TypingHandler)
	OnConnectionStateChanged(fn ConnectionHandler)
}

// StatusSimulator runs background simulation of contact status changes.
// Implementations must stop all background goroutines when ctx is cancelled
// and block on Wait until they are fully stopped.
type StatusSimulator interface {
	StartStatusSimulation(ctx context.Context)
	Wait()
}

// Messenger composes all messaging sub-interfaces into a single contract.
// Implementations may be a stub (for development), a local p2p node, etc.
type Messenger interface {
	IdentityProvider
	ContactManager
	ChatService
	SettingsManager
	EventSubscriber
	StatusSimulator
}

// ContactStatusEvent is the payload emitted for contact status changes.
type ContactStatusEvent struct {
	ContactID string `json:"contactID"`
	IsOnline  bool   `json:"isOnline"`
	LastSeen  int64  `json:"lastSeen"`
}

// MessageStatusEvent is the payload emitted for message delivery status changes.
type MessageStatusEvent struct {
	MessageID string               `json:"messageID"`
	ChatID    string               `json:"chatID"`
	Status    domain.MessageStatus `json:"status"`
}

// TypingEvent is the payload emitted when a contact starts or stops typing.
type TypingEvent struct {
	ContactID string `json:"contactID"`
	IsTyping  bool   `json:"isTyping"`
}

// ConnectionEvent is the payload emitted when connection state changes.
type ConnectionEvent struct {
	State string `json:"state"`
}
