package domain

// User represents the local user's identity.
type User struct {
	PublicID    string `json:"publicID"`
	PublicKey   string `json:"publicKey"`
	DisplayName string `json:"displayName"`
	AvatarPath  string `json:"avatarPath"`
	CreatedAt   int64  `json:"createdAt"`
}
