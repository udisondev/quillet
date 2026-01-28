package stub

import (
	"context"
	"errors"
	"sync"
	"testing"

	"quillet/internal/domain"
)

func newCtx() context.Context {
	return context.Background()
}

func mustProfile(t *testing.T, s *StubMessenger) *domain.User {
	t.Helper()
	p, err := s.GetProfile(newCtx())
	if err != nil {
		t.Fatalf("GetProfile() error = %v", err)
	}
	return p
}

func mustAddContact(t *testing.T, s *StubMessenger, publicID, name string) *domain.Contact {
	t.Helper()
	c, err := s.AddContact(newCtx(), publicID, name)
	if err != nil {
		t.Fatalf("AddContact(%q, %q) error = %v", publicID, name, err)
	}
	return c
}

func mustSendMessage(t *testing.T, s *StubMessenger, contactID, content string) *domain.Message {
	t.Helper()
	msg, err := s.SendMessage(newCtx(), contactID, content)
	if err != nil {
		t.Fatalf("SendMessage(%q, %q) error = %v", contactID, content, err)
	}
	return msg
}

// --- GetProfile / UpdateProfile ---

func TestGetProfile(t *testing.T) {
	s := NewStubMessenger()
	p := mustProfile(t, s)

	if p.PublicID == "" {
		t.Error("GetProfile() PublicID is empty")
	}
	if p.DisplayName == "" {
		t.Error("GetProfile() DisplayName is empty")
	}
}

func TestGetProfile_ReturnsCopy(t *testing.T) {
	s := NewStubMessenger()
	p1 := mustProfile(t, s)
	p2 := mustProfile(t, s)

	p1.DisplayName = "mutated"
	if p2.DisplayName == "mutated" {
		t.Error("GetProfile() returned shared pointer; want independent copies")
	}
}

func TestUpdateProfile(t *testing.T) {
	s := NewStubMessenger()
	newName := "Updated Name"

	if err := s.UpdateProfile(newCtx(), newName); err != nil {
		t.Fatalf("UpdateProfile(%q) error = %v", newName, err)
	}

	p := mustProfile(t, s)
	if p.DisplayName != newName {
		t.Errorf("DisplayName = %q; want %q", p.DisplayName, newName)
	}
}

// --- AddContact ---

func TestAddContact(t *testing.T) {
	tests := []struct {
		name      string
		publicID  string
		display   string
		wantErr   error
		setupDup  bool
	}{
		{
			name:     "success",
			publicID: "new-contact",
			display:  "New Contact",
		},
		{
			name:     "duplicate",
			publicID: "dup-contact",
			display:  "Dup",
			wantErr:  domain.ErrContactExists,
			setupDup: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			ctx := newCtx()

			if tt.setupDup {
				mustAddContact(t, s, tt.publicID, tt.display)
			}

			c, err := s.AddContact(ctx, tt.publicID, tt.display)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("AddContact() error = %v; want %v", err, tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("AddContact() error = %v", err)
			}
			if c.PublicID != tt.publicID {
				t.Errorf("PublicID = %q; want %q", c.PublicID, tt.publicID)
			}
			if c.DisplayName != tt.display {
				t.Errorf("DisplayName = %q; want %q", c.DisplayName, tt.display)
			}
		})
	}
}

func TestAddContact_ExistingDefault(t *testing.T) {
	s := NewStubMessenger()
	_, err := s.AddContact(newCtx(), "alice-id", "Alice Again")
	if !errors.Is(err, domain.ErrContactExists) {
		t.Fatalf("AddContact(existing) error = %v; want %v", err, domain.ErrContactExists)
	}
}

// --- RemoveContact ---

func TestRemoveContact(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "alice-id",
		},
		{
			name:      "not found",
			contactID: "nonexistent",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()

			err := s.RemoveContact(newCtx(), tt.contactID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("RemoveContact(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("RemoveContact(%q) error = %v", tt.contactID, err)
			}

			// после удаления контакт не найден
			err = s.RemoveContact(newCtx(), tt.contactID)
			if !errors.Is(err, domain.ErrContactNotFound) {
				t.Errorf("RemoveContact(%q) second call error = %v; want %v",
					tt.contactID, err, domain.ErrContactNotFound)
			}
		})
	}
}

// --- BlockContact / UnblockContact ---

func TestBlockContact(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "alice-id",
		},
		{
			name:      "not found",
			contactID: "nonexistent",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			err := s.BlockContact(newCtx(), tt.contactID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("BlockContact(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("BlockContact(%q) error = %v", tt.contactID, err)
			}

			contacts, err := s.GetContacts(newCtx())
			if err != nil {
				t.Fatalf("GetContacts() error = %v", err)
			}
			for _, c := range contacts {
				if c.PublicID == tt.contactID && !c.IsBlocked {
					t.Errorf("contact %q IsBlocked = false; want true", tt.contactID)
				}
			}
		})
	}
}

func TestUnblockContact(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "diana-id",
		},
		{
			name:      "not found",
			contactID: "nonexistent",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			err := s.UnblockContact(newCtx(), tt.contactID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("UnblockContact(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("UnblockContact(%q) error = %v", tt.contactID, err)
			}

			contacts, err := s.GetContacts(newCtx())
			if err != nil {
				t.Fatalf("GetContacts() error = %v", err)
			}
			for _, c := range contacts {
				if c.PublicID == tt.contactID && c.IsBlocked {
					t.Errorf("contact %q IsBlocked = true; want false", tt.contactID)
				}
			}
		})
	}
}

// --- GetMessages ---

func TestGetMessages(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		limit     int
		beforeID  string
		wantErr   error
		wantLen   int
		wantNil   bool
	}{
		{
			name:      "all alice messages",
			contactID: "alice-id",
			limit:     50,
			wantLen:   5,
		},
		{
			name:      "limit 2",
			contactID: "alice-id",
			limit:     2,
			wantLen:   2,
		},
		{
			name:      "before msg-a3",
			contactID: "alice-id",
			limit:     50,
			beforeID:  "msg-a3",
			wantLen:   2,
		},
		{
			name:      "before msg-a3 limit 1",
			contactID: "alice-id",
			limit:     1,
			beforeID:  "msg-a3",
			wantLen:   1,
		},
		{
			name:      "invalid beforeID",
			contactID: "alice-id",
			limit:     50,
			beforeID:  "nonexistent-msg",
			wantErr:   domain.ErrMessageNotFound,
		},
		{
			name:      "nonexistent contact",
			contactID: "nonexistent",
			limit:     50,
			wantErr:   domain.ErrContactNotFound,
		},
		{
			name:      "contact without messages",
			contactID: "charlie-id",
			limit:     50,
			wantNil:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			msgs, err := s.GetMessages(newCtx(), tt.contactID, tt.limit, tt.beforeID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("GetMessages(%q, %d, %q) error = %v; want %v",
						tt.contactID, tt.limit, tt.beforeID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("GetMessages(%q, %d, %q) error = %v",
					tt.contactID, tt.limit, tt.beforeID, err)
			}

			if tt.wantNil {
				if msgs != nil {
					t.Fatalf("GetMessages() = %v; want nil", msgs)
				}
				return
			}

			if len(msgs) != tt.wantLen {
				t.Errorf("GetMessages() len = %d; want %d", len(msgs), tt.wantLen)
			}
		})
	}
}

func TestGetMessages_PaginationOrder(t *testing.T) {
	s := NewStubMessenger()
	msgs, err := s.GetMessages(newCtx(), "alice-id", 3, "msg-a5")
	if err != nil {
		t.Fatalf("GetMessages() error = %v", err)
	}
	if len(msgs) != 3 {
		t.Fatalf("GetMessages() len = %d; want 3", len(msgs))
	}

	wantIDs := []string{"msg-a2", "msg-a3", "msg-a4"}
	for i, wantID := range wantIDs {
		if msgs[i].ID != wantID {
			t.Errorf("msgs[%d].ID = %q; want %q", i, msgs[i].ID, wantID)
		}
	}
}

func TestGetMessages_DefaultLimit(t *testing.T) {
	s := NewStubMessenger()
	msgs, err := s.GetMessages(newCtx(), "alice-id", 0, "")
	if err != nil {
		t.Fatalf("GetMessages() error = %v", err)
	}
	if len(msgs) != 5 {
		t.Errorf("GetMessages(limit=0) len = %d; want 5 (all messages)", len(msgs))
	}
}

// --- SendMessage ---

func TestSendMessage(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		content   string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "alice-id",
			content:   "Hello!",
		},
		{
			name:      "nonexistent contact",
			contactID: "nonexistent",
			content:   "Hello!",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			msg, err := s.SendMessage(ctx, tt.contactID, tt.content)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("SendMessage(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("SendMessage() error = %v", err)
			}
			if msg.ID == "" {
				t.Error("SendMessage() msg.ID is empty")
			}
			if msg.Content != tt.content {
				t.Errorf("msg.Content = %q; want %q", msg.Content, tt.content)
			}
			if msg.ChatID != tt.contactID {
				t.Errorf("msg.ChatID = %q; want %q", msg.ChatID, tt.contactID)
			}
			if msg.Status != domain.StatusSending {
				t.Errorf("msg.Status = %q; want %q", msg.Status, domain.StatusSending)
			}

			cancel()
			s.Wait()
		})
	}
}

func TestSendMessage_AppendsToHistory(t *testing.T) {
	s := NewStubMessenger()
	ctx, cancel := context.WithCancel(context.Background())
	defer func() {
		cancel()
		s.Wait()
	}()

	before, err := s.GetMessages(ctx, "alice-id", 0, "")
	if err != nil {
		t.Fatalf("GetMessages() error = %v", err)
	}

	mustSendMessage(t, s, "alice-id", "test message")

	after, err := s.GetMessages(ctx, "alice-id", 0, "")
	if err != nil {
		t.Fatalf("GetMessages() error = %v", err)
	}
	if len(after) != len(before)+1 {
		t.Errorf("messages count = %d; want %d", len(after), len(before)+1)
	}
}

// --- MarkAsRead ---

func TestMarkAsRead(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "alice-id",
		},
		{
			name:      "nonexistent contact",
			contactID: "nonexistent",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			err := s.MarkAsRead(newCtx(), tt.contactID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("MarkAsRead(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("MarkAsRead(%q) error = %v", tt.contactID, err)
			}

			summaries, err := s.GetChatSummaries(newCtx())
			if err != nil {
				t.Fatalf("GetChatSummaries() error = %v", err)
			}
			for _, cs := range summaries {
				if cs.ContactID == tt.contactID && cs.UnreadCount != 0 {
					t.Errorf("UnreadCount = %d; want 0", cs.UnreadCount)
				}
			}
		})
	}
}

// --- ClearHistory ---

func TestClearHistory(t *testing.T) {
	tests := []struct {
		name      string
		contactID string
		wantErr   error
	}{
		{
			name:      "success",
			contactID: "alice-id",
		},
		{
			name:      "nonexistent contact",
			contactID: "nonexistent",
			wantErr:   domain.ErrContactNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewStubMessenger()
			err := s.ClearHistory(newCtx(), tt.contactID)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("ClearHistory(%q) error = %v; want %v", tt.contactID, err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("ClearHistory(%q) error = %v", tt.contactID, err)
			}

			msgs, err := s.GetMessages(newCtx(), tt.contactID, 0, "")
			if err != nil {
				t.Fatalf("GetMessages() error = %v", err)
			}
			if msgs != nil {
				t.Errorf("GetMessages() after ClearHistory = %v; want nil", msgs)
			}
		})
	}
}

// --- GetChatSummaries ---

func TestGetChatSummaries(t *testing.T) {
	s := NewStubMessenger()
	summaries, err := s.GetChatSummaries(newCtx())
	if err != nil {
		t.Fatalf("GetChatSummaries() error = %v", err)
	}
	if len(summaries) == 0 {
		t.Fatal("GetChatSummaries() returned empty list")
	}

	for _, cs := range summaries {
		if cs.ContactID == "" {
			t.Error("ChatSummary.ContactID is empty")
		}
	}
}

func TestGetChatSummaries_SortedNewestFirst(t *testing.T) {
	s := NewStubMessenger()
	summaries, err := s.GetChatSummaries(newCtx())
	if err != nil {
		t.Fatalf("GetChatSummaries() error = %v", err)
	}

	for i := 1; i < len(summaries); i++ {
		prev := sortKey(summaries[i-1])
		curr := sortKey(summaries[i])
		if prev < curr {
			t.Errorf("summaries[%d] timestamp %d < summaries[%d] timestamp %d; want newest first",
				i-1, prev, i, curr)
		}
	}
}

func sortKey(cs domain.ChatSummary) int64 {
	if cs.LastMessage != nil {
		return cs.LastMessage.Timestamp
	}
	return cs.Contact.AddedAt
}

func TestGetChatSummaries_UnreadCount(t *testing.T) {
	s := NewStubMessenger()
	summaries, err := s.GetChatSummaries(newCtx())
	if err != nil {
		t.Fatalf("GetChatSummaries() error = %v", err)
	}

	counts := make(map[string]int, len(summaries))
	for _, cs := range summaries {
		counts[cs.ContactID] = cs.UnreadCount
	}

	if got := counts["alice-id"]; got != 1 {
		t.Errorf("alice-id UnreadCount = %d; want 1", got)
	}
	if got := counts["bob-id"]; got != 2 {
		t.Errorf("bob-id UnreadCount = %d; want 2", got)
	}
}

// --- GetSettings / UpdateSettings ---

func TestGetSettings(t *testing.T) {
	s := NewStubMessenger()
	settings, err := s.GetSettings(newCtx())
	if err != nil {
		t.Fatalf("GetSettings() error = %v", err)
	}
	if settings.Theme == "" {
		t.Error("GetSettings() Theme is empty")
	}
	if settings.SidebarWidth <= 0 {
		t.Errorf("GetSettings() SidebarWidth = %d; want > 0", settings.SidebarWidth)
	}
}

func TestGetSettings_ReturnsCopy(t *testing.T) {
	s := NewStubMessenger()
	s1, err := s.GetSettings(newCtx())
	if err != nil {
		t.Fatalf("GetSettings() error = %v", err)
	}
	s2, err := s.GetSettings(newCtx())
	if err != nil {
		t.Fatalf("GetSettings() error = %v", err)
	}

	s1.Theme = "mutated"
	if s2.Theme == "mutated" {
		t.Error("GetSettings() returned shared pointer; want independent copies")
	}
}

func TestUpdateSettings(t *testing.T) {
	s := NewStubMessenger()
	want := domain.Settings{
		Theme:              "dark",
		NotificationsOn:    false,
		SoundOn:            false,
		ShowMessagePreview: false,
		SidebarWidth:       400,
	}

	if err := s.UpdateSettings(newCtx(), want); err != nil {
		t.Fatalf("UpdateSettings() error = %v", err)
	}

	got, err := s.GetSettings(newCtx())
	if err != nil {
		t.Fatalf("GetSettings() error = %v", err)
	}
	if got.Theme != want.Theme {
		t.Errorf("Theme = %q; want %q", got.Theme, want.Theme)
	}
	if got.NotificationsOn != want.NotificationsOn {
		t.Errorf("NotificationsOn = %v; want %v", got.NotificationsOn, want.NotificationsOn)
	}
	if got.SoundOn != want.SoundOn {
		t.Errorf("SoundOn = %v; want %v", got.SoundOn, want.SoundOn)
	}
	if got.ShowMessagePreview != want.ShowMessagePreview {
		t.Errorf("ShowMessagePreview = %v; want %v", got.ShowMessagePreview, want.ShowMessagePreview)
	}
	if got.SidebarWidth != want.SidebarWidth {
		t.Errorf("SidebarWidth = %d; want %d", got.SidebarWidth, want.SidebarWidth)
	}
}

// --- GetContacts ---

func TestGetContacts_Sorted(t *testing.T) {
	s := NewStubMessenger()
	contacts, err := s.GetContacts(newCtx())
	if err != nil {
		t.Fatalf("GetContacts() error = %v", err)
	}
	if len(contacts) == 0 {
		t.Fatal("GetContacts() returned empty list")
	}

	for i := 1; i < len(contacts); i++ {
		if contacts[i-1].DisplayName > contacts[i].DisplayName {
			t.Errorf("contacts not sorted: %q > %q", contacts[i-1].DisplayName, contacts[i].DisplayName)
		}
	}
}

// --- Callbacks ---

func TestOnNewMessage_Callback(t *testing.T) {
	s := NewStubMessenger()
	ctx, cancel := context.WithCancel(context.Background())
	defer func() {
		cancel()
		s.Wait()
	}()

	called := make(chan domain.Message, 1)
	s.OnNewMessage(func(msg domain.Message) {
		select {
		case called <- msg:
		default:
		}
	})

	_ = mustSendMessage(t, s, "alice-id", "trigger reply")

	// ждём автоответ или таймаут через cancel
	select {
	case msg := <-called:
		if msg.ChatID != "alice-id" {
			t.Errorf("callback msg.ChatID = %q; want %q", msg.ChatID, "alice-id")
		}
	case <-ctx.Done():
		// допустимо — контекст мог быть отменён раньше, чем автоответ
	}
}

// --- Concurrent access ---

func TestConcurrentAccess(t *testing.T) {
	s := NewStubMessenger()
	ctx, cancel := context.WithCancel(context.Background())
	defer func() {
		cancel()
		s.Wait()
	}()

	const goroutines = 10

	t.Run("parallel_operations", func(t *testing.T) {
		var wg sync.WaitGroup
		wg.Add(goroutines)

		for range goroutines {
			go func() {
				defer wg.Done()

				if _, err := s.GetProfile(ctx); err != nil {
					t.Errorf("GetProfile() error = %v", err)
				}

				if _, err := s.GetContacts(ctx); err != nil {
					t.Errorf("GetContacts() error = %v", err)
				}

				if _, err := s.GetMessages(ctx, "alice-id", 10, ""); err != nil {
					t.Errorf("GetMessages() error = %v", err)
				}

				if _, err := s.GetChatSummaries(ctx); err != nil {
					t.Errorf("GetChatSummaries() error = %v", err)
				}

				if _, err := s.GetSettings(ctx); err != nil {
					t.Errorf("GetSettings() error = %v", err)
				}

				if err := s.MarkAsRead(ctx, "alice-id"); err != nil {
					t.Errorf("MarkAsRead() error = %v", err)
				}

				if err := s.UpdateProfile(ctx, "concurrent-name"); err != nil {
					t.Errorf("UpdateProfile() error = %v", err)
				}

				if err := s.UpdateSettings(ctx, domain.Settings{
					Theme:        "dark",
					SidebarWidth: 300,
				}); err != nil {
					t.Errorf("UpdateSettings() error = %v", err)
				}
			}()
		}

		wg.Wait()
	})
}

func TestConcurrentSendAndRead(t *testing.T) {
	s := NewStubMessenger()
	ctx, cancel := context.WithCancel(context.Background())
	defer func() {
		cancel()
		s.Wait()
	}()

	const writers = 5
	const readers = 5

	var wg sync.WaitGroup
	wg.Add(writers + readers)

	for range writers {
		go func() {
			defer wg.Done()
			_, _ = s.SendMessage(ctx, "bob-id", "concurrent msg")
		}()
	}

	for range readers {
		go func() {
			defer wg.Done()
			_, _ = s.GetMessages(ctx, "bob-id", 50, "")
		}()
	}

	wg.Wait()
}

// --- Context cancellation ---

func TestContextCancellation(t *testing.T) {
	s := NewStubMessenger()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	if _, err := s.GetProfile(ctx); err == nil {
		t.Error("GetProfile() with cancelled ctx; want error")
	}
	if err := s.UpdateProfile(ctx, "name"); err == nil {
		t.Error("UpdateProfile() with cancelled ctx; want error")
	}
	if _, err := s.GetContacts(ctx); err == nil {
		t.Error("GetContacts() with cancelled ctx; want error")
	}
	if _, err := s.GetMessages(ctx, "alice-id", 10, ""); err == nil {
		t.Error("GetMessages() with cancelled ctx; want error")
	}
	if _, err := s.GetChatSummaries(ctx); err == nil {
		t.Error("GetChatSummaries() with cancelled ctx; want error")
	}
	if _, err := s.GetSettings(ctx); err == nil {
		t.Error("GetSettings() with cancelled ctx; want error")
	}
	if err := s.UpdateSettings(ctx, domain.Settings{}); err == nil {
		t.Error("UpdateSettings() with cancelled ctx; want error")
	}
	if err := s.MarkAsRead(ctx, "alice-id"); err == nil {
		t.Error("MarkAsRead() with cancelled ctx; want error")
	}
	if err := s.ClearHistory(ctx, "alice-id"); err == nil {
		t.Error("ClearHistory() with cancelled ctx; want error")
	}
}

// --- RemoveContact cleans up messages ---

func TestRemoveContact_CleansMessages(t *testing.T) {
	s := NewStubMessenger()

	if err := s.RemoveContact(newCtx(), "alice-id"); err != nil {
		t.Fatalf("RemoveContact() error = %v", err)
	}

	msgs, err := s.GetMessages(newCtx(), "alice-id", 0, "")
	if !errors.Is(err, domain.ErrContactNotFound) {
		t.Errorf("GetMessages() after RemoveContact error = %v; want %v", err, domain.ErrContactNotFound)
	}
	if msgs != nil {
		t.Errorf("GetMessages() after RemoveContact = %v; want nil", msgs)
	}
}

// --- BlockContact then UnblockContact roundtrip ---

func TestBlockUnblockRoundtrip(t *testing.T) {
	s := NewStubMessenger()
	id := "alice-id"

	if err := s.BlockContact(newCtx(), id); err != nil {
		t.Fatalf("BlockContact() error = %v", err)
	}

	contacts, err := s.GetContacts(newCtx())
	if err != nil {
		t.Fatalf("GetContacts() error = %v", err)
	}
	found := false
	for _, c := range contacts {
		if c.PublicID == id {
			found = true
			if !c.IsBlocked {
				t.Error("after BlockContact IsBlocked = false; want true")
			}
		}
	}
	if !found {
		t.Fatalf("contact %q not found", id)
	}

	if err := s.UnblockContact(newCtx(), id); err != nil {
		t.Fatalf("UnblockContact() error = %v", err)
	}

	contacts, err = s.GetContacts(newCtx())
	if err != nil {
		t.Fatalf("GetContacts() error = %v", err)
	}
	for _, c := range contacts {
		if c.PublicID == id && c.IsBlocked {
			t.Error("after UnblockContact IsBlocked = true; want false")
		}
	}
}
