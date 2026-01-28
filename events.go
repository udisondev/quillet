package main

// Wails event name constants.
// Namespace convention: "domain:action"
const (
	EventAppReady        = "app:ready"
	EventMessageReceived = "message:received"
	EventMessageStatus   = "message:status"
	EventContactStatus   = "contact:status"

	EventContactTyping   = "contact:typing"
	EventConnectionState = "connection:state"

	// The following events are reserved for future use and
	// are not currently emitted from the Go backend.
	EventAppError        = "app:error"
	EventContactUpdated  = "contact:updated"
	EventSettingsChanged = "settings:changed"
)
