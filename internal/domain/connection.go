package domain

// ConnectionState represents the network connection status.
type ConnectionState string

const (
	ConnectionConnected    ConnectionState = "connected"
	ConnectionConnecting   ConnectionState = "connecting"
	ConnectionDisconnected ConnectionState = "disconnected"
)
