package domain

// ConnectionState represents the network connection status.
type ConnectionState string

const (
	ConnectionConnected    ConnectionState = "connected"
	ConnectionConnecting   ConnectionState = "connecting"
	ConnectionDisconnected ConnectionState = "disconnected"
)

// ContactConnectionState links a contact to their connection state.
type ContactConnectionState struct {
	ContactID string          `json:"contactID"`
	State     ConnectionState `json:"state"`
}

// Settings holds user-configurable application preferences.
type Settings struct {
	Theme              string `json:"theme"`
	NotificationsOn    bool   `json:"notificationsOn"`
	SoundOn            bool   `json:"soundOn"`
	ShowMessagePreview bool   `json:"showMessagePreview"`
	SidebarWidth       int    `json:"sidebarWidth"`
}
