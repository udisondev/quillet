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

const (
	defaultPageLimit = 50

	// Simulated delay ranges (milliseconds).
	delayFastMin = 10
	delayFastMax = 30
	delayShortMin = 20
	delayShortMax = 50
	delayMediumMin = 20
	delayMediumMax = 60
	delayProfileMin = 30
	delayProfileMax = 80
	delayAddContactMin = 50
	delayAddContactMax = 150

	// Message delivery simulation delays (milliseconds).
	deliverySendingMin  = 150
	deliverySendingMax  = 300
	deliveryDeliveredMin = 400
	deliveryDeliveredMax = 700
	deliveryAutoReplyMin = 1000
	deliveryAutoReplyMax = 3000

	// Status simulation interval range (seconds).
	statusSimMinSec = 10
	statusSimMaxSec = 30
)

// StubMessenger implements messenger.Messenger with in-memory test data.
type StubMessenger struct {
	mu           sync.RWMutex
	wg           sync.WaitGroup
	profile      *domain.User
	contacts     map[string]*domain.Contact
	messages     map[string][]domain.Message // contactID → messages
	settings     *domain.Settings
	unreadCounts map[string]int

	onNewMessage           func(domain.Message)
	onContactStatusChanged messenger.ContactStatusHandler
	onMessageStatusChanged messenger.MessageStatusHandler
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

func (s *StubMessenger) GetProfile(ctx context.Context) (*domain.User, error) {
	if !simulateDelay(ctx, delayShortMin, delayShortMax) {
		return nil, ctx.Err()
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	u := *s.profile
	return &u, nil
}

func (s *StubMessenger) UpdateProfile(ctx context.Context, displayName string) error {
	if !simulateDelay(ctx, delayProfileMin, delayProfileMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	s.profile.DisplayName = displayName
	return nil
}

// --- Contacts ---

func (s *StubMessenger) GetContacts(ctx context.Context) ([]domain.Contact, error) {
	if !simulateDelay(ctx, delayMediumMin, delayMediumMax) {
		return nil, ctx.Err()
	}
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

func (s *StubMessenger) AddContact(ctx context.Context, publicID, displayName string) (*domain.Contact, error) {
	if !simulateDelay(ctx, delayAddContactMin, delayAddContactMax) {
		return nil, ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[publicID]; exists {
		return nil, fmt.Errorf("add contact: %w", domain.ErrContactExists)
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

func (s *StubMessenger) RemoveContact(ctx context.Context, contactID string) error {
	if !simulateDelay(ctx, delayProfileMin, delayProfileMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return fmt.Errorf("remove contact: %w", domain.ErrContactNotFound)
	}
	delete(s.contacts, contactID)
	delete(s.messages, contactID)
	delete(s.unreadCounts, contactID)
	return nil
}

func (s *StubMessenger) BlockContact(ctx context.Context, contactID string) error {
	if !simulateDelay(ctx, delayProfileMin, delayProfileMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	c, exists := s.contacts[contactID]
	if !exists {
		return fmt.Errorf("block contact: %w", domain.ErrContactNotFound)
	}
	c.IsBlocked = true
	return nil
}

func (s *StubMessenger) UnblockContact(ctx context.Context, contactID string) error {
	if !simulateDelay(ctx, delayProfileMin, delayProfileMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	c, exists := s.contacts[contactID]
	if !exists {
		return fmt.Errorf("unblock contact: %w", domain.ErrContactNotFound)
	}
	c.IsBlocked = false
	return nil
}

// --- Conversations ---

func (s *StubMessenger) GetChatSummaries(ctx context.Context) ([]domain.ChatSummary, error) {
	if !simulateDelay(ctx, delayProfileMin, delayProfileMax) {
		return nil, ctx.Err()
	}
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
		ti := s.chatSortKey(summaries[i])
		tj := s.chatSortKey(summaries[j])
		return ti > tj // newest first
	})

	return summaries, nil
}

// chatSortKey returns a sort key for a ChatSummary.
// Uses LastMessage timestamp when available, falls back to contact's AddedAt.
func (s *StubMessenger) chatSortKey(cs domain.ChatSummary) int64 {
	if cs.LastMessage != nil {
		return cs.LastMessage.Timestamp
	}
	return cs.Contact.AddedAt
}

func (s *StubMessenger) SendMessage(ctx context.Context, contactID, content string) (*domain.Message, error) {
	if !simulateDelay(ctx, delayMediumMin, delayMediumMax) {
		return nil, ctx.Err()
	}

	msg, err := s.recordOutgoingMessage(contactID, content)
	if err != nil {
		return nil, err
	}

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		s.simulateMessageDelivery(ctx, msg.ID, contactID)
	}()

	return msg, nil
}

// recordOutgoingMessage creates and stores a new outgoing message under the lock.
func (s *StubMessenger) recordOutgoingMessage(contactID, content string) (*domain.Message, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return nil, fmt.Errorf("send message: %w", domain.ErrContactNotFound)
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
	if !simulateDelay(ctx, deliverySendingMin, deliverySendingMax) {
		return
	}
	s.updateMessageStatus(msgID, contactID, domain.StatusSent)

	// sent → delivered
	if !simulateDelay(ctx, deliveryDeliveredMin, deliveryDeliveredMax) {
		return
	}
	s.updateMessageStatus(msgID, contactID, domain.StatusDelivered)

	// auto-reply after delay
	if !simulateDelay(ctx, deliveryAutoReplyMin, deliveryAutoReplyMax) {
		return
	}
	s.sendAutoReply(contactID)
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
	reply, cb := s.prepareAutoReply(contactID)
	if reply == nil {
		return
	}
	if cb != nil {
		cb(*reply)
	}
}

// prepareAutoReply creates and stores an auto-reply message under the lock.
// Returns nil if the contact does not exist or is blocked.
func (s *StubMessenger) prepareAutoReply(contactID string) (*domain.Message, func(domain.Message)) {
	s.mu.Lock()
	defer s.mu.Unlock()

	c, exists := s.contacts[contactID]
	if !exists || c.IsBlocked {
		return nil, nil
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

	return &reply, s.onNewMessage
}

func (s *StubMessenger) GetMessages(ctx context.Context, contactID string, limit int, beforeID string) ([]domain.Message, error) {
	if !simulateDelay(ctx, delayMediumMin, delayMediumMax) {
		return nil, ctx.Err()
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	msgs, ok := s.messages[contactID]
	if !ok {
		if _, contactExists := s.contacts[contactID]; !contactExists {
			return nil, fmt.Errorf("get messages: %w", domain.ErrContactNotFound)
		}
		return nil, nil
	}

	if limit <= 0 {
		limit = defaultPageLimit
	}

	endIdx := len(msgs)
	if beforeID != "" {
		found := false
		for i, m := range msgs {
			if m.ID == beforeID {
				endIdx = i
				found = true
				break
			}
		}
		if !found {
			return nil, fmt.Errorf("get messages: %w", domain.ErrMessageNotFound)
		}
	}

	startIdx := max(endIdx-limit, 0)

	result := make([]domain.Message, endIdx-startIdx)
	copy(result, msgs[startIdx:endIdx])
	return result, nil
}

func (s *StubMessenger) ClearHistory(ctx context.Context, contactID string) error {
	if !simulateDelay(ctx, delayShortMin, delayShortMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return fmt.Errorf("clear history: %w", domain.ErrContactNotFound)
	}
	delete(s.messages, contactID)
	return nil
}

func (s *StubMessenger) MarkAsRead(ctx context.Context, contactID string) error {
	if !simulateDelay(ctx, delayFastMin, delayFastMax) {
		return ctx.Err()
	}
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.contacts[contactID]; !exists {
		return fmt.Errorf("mark as read: %w", domain.ErrContactNotFound)
	}
	s.unreadCounts[contactID] = 0
	return nil
}

// --- Settings ---

func (s *StubMessenger) GetSettings(ctx context.Context) (*domain.Settings, error) {
	if !simulateDelay(ctx, delayFastMin, delayFastMax) {
		return nil, ctx.Err()
	}
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := *s.settings
	return &out, nil
}

func (s *StubMessenger) UpdateSettings(ctx context.Context, settings domain.Settings) error {
	if !simulateDelay(ctx, delayShortMin, delayShortMax) {
		return ctx.Err()
	}
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

func (s *StubMessenger) OnContactStatusChanged(fn messenger.ContactStatusHandler) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onContactStatusChanged = fn
}

func (s *StubMessenger) OnMessageStatusChanged(fn messenger.MessageStatusHandler) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.onMessageStatusChanged = fn
}

// --- Simulation ---

// StartStatusSimulation periodically toggles random contacts online/offline.
// The goroutine stops when ctx is cancelled. Call Wait to block until it exits.
func (s *StubMessenger) StartStatusSimulation(ctx context.Context) {
	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		for {
			delay := statusSimMinSec + rand.IntN(statusSimMaxSec-statusSimMinSec+1)
			timer := time.NewTimer(time.Duration(delay) * time.Second)
			select {
			case <-ctx.Done():
				timer.Stop()
				return
			case <-timer.C:
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

// Wait blocks until all background goroutines have stopped.
func (s *StubMessenger) Wait() {
	s.wg.Wait()
}
