package main

// Wails event name constants.
// Namespace convention: "domain:action"
const (
	EventAppReady        = "app:ready"
	EventMessageReceived = "message:received"
	EventMessageStatus   = "message:status"
	EventContactStatus   = "contact:status"

	// The following events are reserved for frontend use and
	// are not currently emitted from the Go backend.
	EventAppError        = "app:error"
	EventContactTyping   = "contact:typing"
	EventContactUpdated  = "contact:updated"
	EventConnectionState = "connection:state"
	EventSettingsChanged = "settings:changed"
)
