package main

import (
	"quillet/internal/domain"
)

// --- Identity ---

// GetIdentity returns the current user's profile.
func (a *App) GetIdentity() (*domain.User, error) {
	return a.messenger.GetProfile(a.ctx)
}

// UpdateProfile changes the current user's display name.
func (a *App) UpdateProfile(displayName string) error {
	return a.messenger.UpdateProfile(a.ctx, displayName)
}

// --- Contacts ---

// GetContacts returns the full contact list.
func (a *App) GetContacts() ([]domain.Contact, error) {
	return a.messenger.GetContacts(a.ctx)
}

// AddContact adds a new contact by public ID.
func (a *App) AddContact(publicID, displayName string) (*domain.Contact, error) {
	return a.messenger.AddContact(a.ctx, publicID, displayName)
}

// DeleteContact removes a contact by ID.
func (a *App) DeleteContact(contactID string) error {
	return a.messenger.RemoveContact(a.ctx, contactID)
}

// BlockContact blocks a contact by ID.
func (a *App) BlockContact(contactID string) error {
	return a.messenger.BlockContact(a.ctx, contactID)
}

// UnblockContact unblocks a contact by ID.
func (a *App) UnblockContact(contactID string) error {
	return a.messenger.UnblockContact(a.ctx, contactID)
}

// --- Conversations ---

// GetChatSummaries returns all conversation previews for the sidebar.
func (a *App) GetChatSummaries() ([]domain.ChatSummary, error) {
	return a.messenger.GetChatSummaries(a.ctx)
}

// SendMessage sends a text message to a contact.
func (a *App) SendMessage(contactID, content string) (*domain.Message, error) {
	return a.messenger.SendMessage(a.ctx, contactID, content)
}

// GetMessages returns paginated messages for a contact.
func (a *App) GetMessages(contactID string, limit int, beforeID string) ([]domain.Message, error) {
	return a.messenger.GetMessages(a.ctx, contactID, limit, beforeID)
}

// MarkAsRead marks all messages in a chat as read.
func (a *App) MarkAsRead(contactID string) error {
	return a.messenger.MarkAsRead(a.ctx, contactID)
}

// ClearHistory removes all messages in a chat.
func (a *App) ClearHistory(contactID string) error {
	return a.messenger.ClearHistory(a.ctx, contactID)
}

// --- Settings ---

// GetSettings returns the current application settings.
func (a *App) GetSettings() (*domain.Settings, error) {
	return a.messenger.GetSettings(a.ctx)
}

// UpdateSettings saves new application settings.
func (a *App) UpdateSettings(settings domain.Settings) error {
	return a.messenger.UpdateSettings(a.ctx, settings)
}
