package domain

// Contact represents a remote peer in the contact list.
type Contact struct {
	PublicID    string `json:"publicID"`
	PublicKey   string `json:"publicKey"`
	DisplayName string `json:"displayName"`
	AvatarPath  string `json:"avatarPath"`
	IsOnline    bool   `json:"isOnline"`
	IsBlocked   bool   `json:"isBlocked"`
	LastSeen    int64  `json:"lastSeen"`
	AddedAt     int64  `json:"addedAt"`
}
