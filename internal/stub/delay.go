package stub

import (
	"context"
	"math/rand/v2"
	"time"
)

// simulateDelay sleeps for a random duration between min and max milliseconds,
// respecting context cancellation. Returns false if the context was cancelled.
func simulateDelay(ctx context.Context, minMs, maxMs int) bool {
	d := time.Duration(minMs+rand.IntN(maxMs-minMs+1)) * time.Millisecond
	timer := time.NewTimer(d)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}
