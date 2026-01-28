package main

import (
	"context"
	"log/slog"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"quillet/internal/domain"
	"quillet/internal/messenger"
	"quillet/internal/stub"
)

// App is the main application struct that manages the Wails lifecycle.
type App struct {
	ctx       context.Context
	messenger messenger.Messenger
	stub      *stub.StubMessenger
}

// NewApp creates a new App instance with a StubMessenger backend.
func NewApp() *App {
	s := stub.NewStubMessenger()
	return &App{
		messenger: s,
		stub:      s,
	}
}

// Startup is called when the Wails app starts.
// The context is saved for calling Wails runtime methods.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	a.messenger.OnNewMessage(func(msg domain.Message) {
		runtime.EventsEmit(a.ctx, EventMessageReceived, msg)
	})

	a.messenger.OnContactStatusChanged(func(contactID string, isOnline bool, lastSeen int64) {
		runtime.EventsEmit(a.ctx, EventContactStatus, map[string]any{
			"contactID": contactID,
			"isOnline":  isOnline,
			"lastSeen":  lastSeen,
		})
	})

	a.messenger.OnMessageStatusChanged(func(messageID string, status domain.MessageStatus) {
		runtime.EventsEmit(a.ctx, EventMessageStatus, map[string]any{
			"messageID": messageID,
			"status":    status,
		})
	})

	a.stub.StartStatusSimulation(ctx)

	slog.Info("application started")
}

// DomReady is called when the frontend DOM is ready.
func (a *App) DomReady(_ context.Context) {
	slog.Info("frontend DOM ready")
	runtime.EventsEmit(a.ctx, EventAppReady, nil)
}

// BeforeClose is called when the user attempts to close the application.
// Return true to prevent closing.
func (a *App) BeforeClose(_ context.Context) bool {
	return false
}

// Shutdown is called when the application is shutting down.
func (a *App) Shutdown(_ context.Context) {
	slog.Info("application shutting down")
}
