package main

// Wails event name constants.
// Namespace convention: "domain:action"
const (
	EventAppReady        = "app:ready"
	EventAppError        = "app:error"
	EventMessageReceived = "message:received"
	EventMessageStatus   = "message:status"
	EventContactStatus   = "contact:status"
	EventContactTyping   = "contact:typing"
	EventContactUpdated  = "contact:updated"
	EventConnectionState = "connection:state"
	EventSettingsChanged = "settings:changed"
)
