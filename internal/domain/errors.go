package domain

import "errors"

// Sentinel errors for contact operations.
var (
	ErrContactNotFound = errors.New("contact not found")
	ErrContactExists   = errors.New("contact already exists")
	ErrContactBlocked  = errors.New("contact is blocked")
)

// Sentinel errors for message operations.
var (
	ErrMessageNotFound = errors.New("message not found")
)

// Sentinel errors for validation.
var (
	ErrEmptyDisplayName = errors.New("display name is empty")
	ErrEmptyContent     = errors.New("message content is empty")
	ErrEmptyPublicID    = errors.New("public ID is empty")
	ErrInvalidLimit     = errors.New("limit must be positive")
	ErrInvalidTheme     = errors.New("invalid theme")
	ErrInvalidSidebar   = errors.New("sidebar width must be positive")
)
