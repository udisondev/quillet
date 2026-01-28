package stub

import (
	"time"

	"quillet/internal/domain"
)

func defaultProfile() *domain.User {
	return &domain.User{
		PublicID:    "me-public-id-0000",
		PublicKey:   "me-public-key-0000",
		DisplayName: "Me",
		AvatarPath:  "",
		CreatedAt:   time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC).UnixMilli(),
	}
}

func defaultContacts() map[string]*domain.Contact {
	now := time.Now()
	return map[string]*domain.Contact{
		"alice-id": {
			PublicID:    "alice-id",
			PublicKey:   "alice-pub-key",
			DisplayName: "Alice",
			AvatarPath:  "",
			IsOnline:    true,
			IsBlocked:   false,
			LastSeen:    now.UnixMilli(),
			AddedAt:     now.Add(-30 * 24 * time.Hour).UnixMilli(),
		},
		"bob-id": {
			PublicID:    "bob-id",
			PublicKey:   "bob-pub-key",
			DisplayName: "Bob",
			AvatarPath:  "",
			IsOnline:    false,
			IsBlocked:   false,
			LastSeen:    now.Add(-2 * time.Hour).UnixMilli(),
			AddedAt:     now.Add(-20 * 24 * time.Hour).UnixMilli(),
		},
		"charlie-id": {
			PublicID:    "charlie-id",
			PublicKey:   "charlie-pub-key",
			DisplayName: "Charlie",
			AvatarPath:  "",
			IsOnline:    true,
			IsBlocked:   false,
			LastSeen:    now.UnixMilli(),
			AddedAt:     now.Add(-10 * 24 * time.Hour).UnixMilli(),
		},
		"diana-id": {
			PublicID:    "diana-id",
			PublicKey:   "diana-pub-key",
			DisplayName: "Diana",
			AvatarPath:  "",
			IsOnline:    false,
			IsBlocked:   true,
			LastSeen:    now.Add(-7 * 24 * time.Hour).UnixMilli(),
			AddedAt:     now.Add(-5 * 24 * time.Hour).UnixMilli(),
		},
	}
}

func defaultMessages(myID string) map[string][]domain.Message {
	now := time.Now()
	return map[string][]domain.Message{
		"alice-id": {
			{
				ID:        "msg-a1",
				ChatID:    "alice-id",
				SenderID:  myID,
				Content:   "Hey Alice!",
				Timestamp: now.Add(-2 * time.Hour).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-a2",
				ChatID:    "alice-id",
				SenderID:  "alice-id",
				Content:   "Hi! How are you?",
				Timestamp: now.Add(-1*time.Hour - 55*time.Minute).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-a3",
				ChatID:    "alice-id",
				SenderID:  myID,
				Content:   "Doing great, thanks! Working on Quillet.",
				Timestamp: now.Add(-1*time.Hour - 50*time.Minute).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-a4",
				ChatID:    "alice-id",
				SenderID:  "alice-id",
				Content:   "Sounds exciting! Tell me more.",
				Timestamp: now.Add(-1*time.Hour - 45*time.Minute).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-a5",
				ChatID:    "alice-id",
				SenderID:  myID,
				Content:   "It's a p2p messenger with e2e encryption.",
				Timestamp: now.Add(-1*time.Hour - 40*time.Minute).UnixMilli(),
				Status:    domain.StatusDelivered,
			},
		},
		"bob-id": {
			{
				ID:        "msg-b1",
				ChatID:    "bob-id",
				SenderID:  "bob-id",
				Content:   "Hey, are you free this weekend?",
				Timestamp: now.Add(-5 * time.Hour).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-b2",
				ChatID:    "bob-id",
				SenderID:  myID,
				Content:   "Let me check my schedule.",
				Timestamp: now.Add(-4*time.Hour - 30*time.Minute).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-b3",
				ChatID:    "bob-id",
				SenderID:  "bob-id",
				Content:   "Sure, no rush!",
				Timestamp: now.Add(-4 * time.Hour).UnixMilli(),
				Status:    domain.StatusRead,
			},
			{
				ID:        "msg-b4",
				ChatID:    "bob-id",
				SenderID:  myID,
				Content:   "I'm free on Saturday afternoon.",
				Timestamp: now.Add(-3 * time.Hour).UnixMilli(),
				Status:    domain.StatusDelivered,
			},
			{
				ID:        "msg-b5",
				ChatID:    "bob-id",
				SenderID:  "bob-id",
				Content:   "Perfect, let's grab coffee then.",
				Timestamp: now.Add(-2*time.Hour - 30*time.Minute).UnixMilli(),
				Status:    domain.StatusRead,
			},
		},
	}
}

func defaultUnreadCounts() map[string]int {
	return map[string]int{
		"alice-id": 1,
		"bob-id":   2,
	}
}

func defaultSettings() *domain.Settings {
	return &domain.Settings{
		Theme:              "system",
		NotificationsOn:    true,
		SoundOn:            true,
		ShowMessagePreview: true,
		SidebarWidth:       320,
	}
}

// autoReplies are canned responses the stub sends back after the user sends a message.
var autoReplies = []string{
	"Got it, thanks!",
	"Interesting, tell me more.",
	"Let me think about that.",
	"Sure thing!",
	"Sounds good to me.",
	"I'll get back to you on that.",
	"Absolutely!",
	"Hmm, I'm not sure about that.",
}
