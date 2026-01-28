package domain

// Settings holds user-configurable application preferences.
type Settings struct {
	Theme              string `json:"theme"`
	NotificationsOn    bool   `json:"notificationsOn"`
	SoundOn            bool   `json:"soundOn"`
	ShowMessagePreview bool   `json:"showMessagePreview"`
	SidebarWidth       int    `json:"sidebarWidth"`
}
