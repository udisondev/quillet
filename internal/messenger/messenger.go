package messenger

import (
	"context"

	"quillet/internal/domain"
)

// Messenger defines the contract for all messaging operations.
// Implementations may be a stub (for development), a local p2p node, etc.
type Messenger interface {
	// Identity
	GetProfile(ctx context.Context) (*domain.User, error)
	UpdateProfile(ctx context.Context, displayName string) error

	// Contacts
	GetContacts(ctx context.Context) ([]domain.Contact, error)
	AddContact(ctx context.Context, publicID, displayName string) (*domain.Contact, error)
	RemoveContact(ctx context.Context, contactID string) error
	BlockContact(ctx context.Context, contactID string) error
	UnblockContact(ctx context.Context, contactID string) error

	// Conversations
	GetChatSummaries(ctx context.Context) ([]domain.ChatSummary, error)
	SendMessage(ctx context.Context, contactID, content string) (*domain.Message, error)
	GetMessages(ctx context.Context, contactID string, limit int, beforeID string) ([]domain.Message, error)
	MarkAsRead(ctx context.Context, contactID string) error

	// Settings
	GetSettings(ctx context.Context) (*domain.Settings, error)
	UpdateSettings(ctx context.Context, settings domain.Settings) error

	// Callbacks — implementations call these to emit events.
	OnNewMessage(fn func(msg domain.Message))
	OnContactStatusChanged(fn func(contactID string, isOnline bool, lastSeen int64))
	OnMessageStatusChanged(fn func(messageID string, status domain.MessageStatus))
}
