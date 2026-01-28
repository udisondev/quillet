package stub

import (
	"math/rand/v2"
	"time"
)

// simulateDelay sleeps for a random duration between min and max milliseconds.
func simulateDelay(minMs, maxMs int) {
	d := minMs + rand.IntN(maxMs-minMs+1)
	time.Sleep(time.Duration(d) * time.Millisecond)
}
