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
}

// SettingsManager handles user-configurable preferences.
type SettingsManager interface {
	GetSettings(ctx context.Context) (*domain.Settings, error)
	UpdateSettings(ctx context.Context, settings domain.Settings) error
}

// EventSubscriber allows registering callbacks for real-time events.
type EventSubscriber interface {
	OnNewMessage(fn func(msg domain.Message))
	OnContactStatusChanged(fn func(contactID string, isOnline bool, lastSeen int64))
	OnMessageStatusChanged(fn func(messageID, chatID string, status domain.MessageStatus))
}

// Messenger composes all messaging sub-interfaces into a single contract.
// Implementations may be a stub (for development), a local p2p node, etc.
type Messenger interface {
	IdentityProvider
	ContactManager
	ChatService
	SettingsManager
	EventSubscriber
}
