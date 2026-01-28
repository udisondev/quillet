package stub

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand/v2"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"quillet/internal/domain"
	"quillet/internal/messenger"
)

// compile-time check
var _ messenger.Messenger = (*StubMessenger)(nil)

// StubMessenger implements messenger.Messenger with in-memory test data.
type StubMessenger struct {
	mu           sync.RWMutex
	profile      *domain.User
	contacts     map[string]*domain.Contact
	messages     map[string][]domain.Message // contactID → messages
	settings     *domain.Settings
	unreadCounts map[string]int

	onNewMessage           func(domain.Message)
	onContactStatusChanged func(string, bool, int64)
	onMessageStatusChanged func(string, string, domain.MessageStatus)
}

// NewStubMessenger creates a StubMessenger pre-populated with test data.
func NewStubMessenger() *StubMessenger {
	profile := defaultProfile()
	return &StubMessenger{
		profile:      profile,
		contacts:     defaultContacts(),
		messages:     defaultMessages(profile.PublicID),
		settings:     defaultSettings(),
		unreadCounts: defaultUnreadCounts(),
	}
}

// --- Identity ---

func (s *StubMessenger) GetProfile(_ context.Context) (*domain.User, error) {
	simulateDelay(20, 50)
	s.mu.RLock()
	defer s.mu.RUnlock()

	u := *s.profile
	return &u, nil
}

func (s *StubMessenger) UpdateProfile(_ context.Context, displayName string) error {
	simulateDelay(30, 80)
	s.mu.Lock()
	defer s.mu.Unlock()

	s.profile.DisplayName = displayName
	return nil
}

// --- Contacts ---

func (s *StubMessenger) GetContacts(_ context.Context) ([]domain.Contact, error) {
	simulateDelay(20, 60)
	s.mu.RLock()
	defer s.mu.RUnlock()

	contacts := make([]domain.Contact, 0, len(s.contacts))
	for _, c := range s.contacts {
		contacts = append(contacts, *c)
	}
	sort.Slice(contacts, func(i, j int) bool {
		return contacts[i].DisplayName < contacts[j].DisplayName
	})
	return contacts, nil
}

func (s *StubMessenger) AddContact(_ context.Context, publicID, displayName string) (*domain.Contact, error) {
	simulateDelay(50, 150)
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[publicID]; exists {
		return nil, fmt.Errorf("add contact: %w", fmt.Errorf("contact %s already exists", publicID))
	}

	c := &domain.Contact{
		PublicID:     publicID,
		PublicKey:    publicID + "-pub-key",
		DisplayName:  displayName,
		IsOnline:     false,
		LastSeen:     time.Now().UnixMilli(),
		AddedAt:      time.Now().UnixMilli(),
	}
	s.contacts[publicID] = c

	out := *c
	return &out, nil
}

func (s *StubMessenger) RemoveContact(_ context.Context, contactID string) error {
	simulateDelay(30, 80)
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return fmt.Errorf("remove contact: contact %s not found", contactID)
	}
	delete(s.contacts, contactID)
	delete(s.messages, contactID)
	delete(s.unreadCounts, contactID)
	return nil
}

func (s *StubMessenger) BlockContact(_ context.Context, contactID string) error {
	simulateDelay(30, 80)
	s.mu.Lock()
	defer s.mu.Unlock()

	c, exists := s.contacts[contactID]
	if !exists {
		return fmt.Errorf("block contact: contact %s not found", contactID)
	}
	c.IsBlocked = true
	return nil
}

func (s *StubMessenger) UnblockContact(_ context.Context, contactID string) error {
	simulateDelay(30, 80)
	s.mu.Lock()
	defer s.mu.Unlock()

	c, exists := s.contacts[contactID]
	if !exists {
		return fmt.Errorf("unblock contact: contact %s not found", contactID)
	}
	c.IsBlocked = false
	return nil
}

// --- Conversations ---

func (s *StubMessenger) GetChatSummaries(_ context.Context) ([]domain.ChatSummary, error) {
	simulateDelay(30, 80)
	s.mu.RLock()
	defer s.mu.RUnlock()

	summaries := make([]domain.ChatSummary, 0, len(s.contacts))
	for id, c := range s.contacts {
		cs := domain.ChatSummary{
			ContactID:   id,
			Contact:     *c,
			UnreadCount: s.unreadCounts[id],
		}
		if msgs, ok := s.messages[id]; ok && len(msgs) > 0 {
			last := msgs[len(msgs)-1]
			cs.LastMessage = &last
		}
		summaries = append(summaries, cs)
	}

	sort.Slice(summaries, func(i, j int) bool {
		ti, tj := int64(0), int64(0)
		if summaries[i].LastMessage != nil {
			ti = summaries[i].LastMessage.Timestamp
		}
		if summaries[j].LastMessage != nil {
			tj = summaries[j].LastMessage.Timestamp
		}
		return ti > tj // newest first
	})

	return summaries, nil
}

func (s *StubMessenger) SendMessage(ctx context.Context, contactID, content string) (*domain.Message, error) {
	simulateDelay(20, 60)

	msg, err := s.recordOutgoingMessage(contactID, content)
	if err != nil {
		return nil, err
	}

	go s.simulateMessageDelivery(ctx, msg.ID, contactID)

	return msg, nil
}

// recordOutgoingMessage creates and stores a new outgoing message under the lock.
func (s *StubMessenger) recordOutgoingMessage(contactID, content string) (*domain.Message, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return nil, fmt.Errorf("send message: contact %s not found", contactID)
	}

	msg := domain.Message{
		ID:        uuid.New().String(),
		ChatID:    contactID,
		SenderID:  s.profile.PublicID,
		Content:   content,
		Timestamp: time.Now().UnixMilli(),
		Status:    domain.StatusSending,
	}
	s.messages[contactID] = append(s.messages[contactID], msg)

	return &msg, nil
}

func (s *StubMessenger) simulateMessageDelivery(ctx context.Context, msgID, contactID string) {
	// sending → sent
	if !sleepWithContext(ctx, 150, 300) {
		return
	}
	s.updateMessageStatus(msgID, contactID, domain.StatusSent)

	// sent → delivered
	if !sleepWithContext(ctx, 400, 700) {
		return
	}
	s.updateMessageStatus(msgID, contactID, domain.StatusDelivered)

	// auto-reply after 1-3s
	if !sleepWithContext(ctx, 1000, 3000) {
		return
	}
	s.sendAutoReply(contactID)
}

// sleepWithContext waits for a random duration between minMs and maxMs, returning
// false if the context was cancelled before the delay elapsed.
func sleepWithContext(ctx context.Context, minMs, maxMs int) bool {
	d := time.Duration(minMs+rand.IntN(maxMs-minMs+1)) * time.Millisecond
	select {
	case <-ctx.Done():
		return false
	case <-time.After(d):
		return true
	}
}

func (s *StubMessenger) updateMessageStatus(msgID, contactID string, status domain.MessageStatus) {
	s.mu.Lock()
	msgs := s.messages[contactID]
	for i := range msgs {
		if msgs[i].ID == msgID {
			msgs[i].Status = status
			break
		}
	}
	cb := s.onMessageStatusChanged
	s.mu.Unlock()

	if cb != nil {
		cb(msgID, contactID, status)
	}
}

func (s *StubMessenger) sendAutoReply(contactID string) {
	s.mu.Lock()
	c, exists := s.contacts[contactID]
	if !exists || c.IsBlocked {
		s.mu.Unlock()
		return
	}

	reply := domain.Message{
		ID:        uuid.New().String(),
		ChatID:    contactID,
		SenderID:  contactID,
		Content:   autoReplies[rand.IntN(len(autoReplies))],
		Timestamp: time.Now().UnixMilli(),
		Status:    domain.StatusDelivered,
	}
	s.messages[contactID] = append(s.messages[contactID], reply)
	s.unreadCounts[contactID]++
	cb := s.onNewMessage
	s.mu.Unlock()

	if cb != nil {
		cb(reply)
	}
}

func (s *StubMessenger) GetMessages(_ context.Context, contactID string, limit int, beforeID string) ([]domain.Message, error) {
	simulateDelay(20, 60)
	s.mu.RLock()
	defer s.mu.RUnlock()

	msgs, ok := s.messages[contactID]
	if !ok {
		return nil, nil
	}

	if limit <= 0 {
		limit = 50
	}

	endIdx := len(msgs)
	if beforeID != "" {
		for i, m := range msgs {
			if m.ID == beforeID {
				endIdx = i
				break
			}
		}
	}

	startIdx := max(endIdx-limit, 0)

	result := make([]domain.Message, endIdx-startIdx)
	copy(result, msgs[startIdx:endIdx])
	return result, nil
}

func (s *StubMessenger) MarkAsRead(_ context.Context, contactID string) error {
	simulateDelay(10, 30)
	s.mu.Lock()
	defer s.mu.Unlock()

	s.unreadCounts[contactID] = 0
	return nil
}

// --- Settings ---

func (s *StubMessenger) GetSettings(_ context.Context) (*domain.Settings, error) {
	simulateDelay(10, 30)
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := *s.settings
	return &out, nil
}

func (s *StubMessenger) UpdateSettings(_ context.Context, settings domain.Settings) error {
	simulateDelay(20, 50)
	s.mu.Lock()
	defer s.mu.Unlock()

	s.settings = &settings
	return nil
}

// --- Callbacks ---

func (s *StubMessenger) OnNewMessage(fn func(msg domain.Message)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onNewMessage = fn
}

func (s *StubMessenger) OnContactStatusChanged(fn func(contactID string, isOnline bool, lastSeen int64)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onContactStatusChanged = fn
}

func (s *StubMessenger) OnMessageStatusChanged(fn func(messageID, chatID string, status domain.MessageStatus)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onMessageStatusChanged = fn
}

// StartStatusSimulation periodically toggles random contacts online/offline.
func (s *StubMessenger) StartStatusSimulation(ctx context.Context) {
	go func() {
		for {
			delay := 10 + rand.IntN(21) // 10-30s
			select {
			case <-ctx.Done():
				return
			case <-time.After(time.Duration(delay) * time.Second):
			}

			s.mu.Lock()
			ids := make([]string, 0, len(s.contacts))
			for id, c := range s.contacts {
				if !c.IsBlocked {
					ids = append(ids, id)
				}
			}
			if len(ids) == 0 {
				s.mu.Unlock()
				continue
			}

			targetID := ids[rand.IntN(len(ids))]
			c := s.contacts[targetID]
			c.IsOnline = !c.IsOnline
			now := time.Now().UnixMilli()
			if !c.IsOnline {
				c.LastSeen = now
			}
			isOnline := c.IsOnline
			cb := s.onContactStatusChanged
			s.mu.Unlock()

			slog.Debug("stub status toggle", "contact", targetID, "online", isOnline)

			if cb != nil {
				cb(targetID, isOnline, now)
			}
		}
	}()
}
