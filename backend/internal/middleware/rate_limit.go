package middleware

import (
	"net"
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements basic in-memory rate limiting
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex

	// Configuration
	pasteLimit     int           // Max pastes per IP per window
	retrievalLimit int           // Max retrieval requests per IP per window
	window         time.Duration // Time window for rate limiting
}

type visitor struct {
	pasteCount     int
	retrievalCount int
	lastSeen       time.Time
}

// NewRateLimiter creates a new rate limiter with specified limits
func NewRateLimiter(pasteLimit, retrievalLimit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors:       make(map[string]*visitor),
		pasteLimit:     pasteLimit,
		retrievalLimit: retrievalLimit,
		window:         window,
	}

	// Start cleanup goroutine
	go rl.cleanupVisitors()

	return rl
}

// NewDefaultRateLimiter creates a rate limiter with default settings from requirements
func NewDefaultRateLimiter() *RateLimiter {
	// From requirements: 10 pastes per IP per hour, 100 requests per IP per hour
	return NewRateLimiter(10, 100, time.Hour)
}

// LimitPasteCreation middleware for limiting paste creation
func (rl *RateLimiter) LimitPasteCreation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)

		if !rl.allowPasteCreation(ip) {
			http.Error(w, "Rate limit exceeded for paste creation", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// LimitPasteRetrieval middleware for limiting paste retrieval
func (rl *RateLimiter) LimitPasteRetrieval(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)

		if !rl.allowPasteRetrieval(ip) {
			http.Error(w, "Rate limit exceeded for paste retrieval", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// allowPasteCreation checks if paste creation is allowed for the given IP
func (rl *RateLimiter) allowPasteCreation(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v := rl.getOrCreateVisitor(ip)

	if v.pasteCount >= rl.pasteLimit {
		return false
	}

	v.pasteCount++
	v.lastSeen = time.Now()
	return true
}

// allowPasteRetrieval checks if paste retrieval is allowed for the given IP
func (rl *RateLimiter) allowPasteRetrieval(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v := rl.getOrCreateVisitor(ip)

	if v.retrievalCount >= rl.retrievalLimit {
		return false
	}

	v.retrievalCount++
	v.lastSeen = time.Now()
	return true
}

// getOrCreateVisitor gets or creates a visitor record for the given IP
func (rl *RateLimiter) getOrCreateVisitor(ip string) *visitor {
	v, exists := rl.visitors[ip]
	if !exists {
		v = &visitor{
			lastSeen: time.Now(),
		}
		rl.visitors[ip] = v
	}
	return v
}

// cleanupVisitors periodically removes old visitor records
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(rl.window)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.window)
		for ip, v := range rl.visitors {
			if v.lastSeen.Before(cutoff) {
				delete(rl.visitors, ip)
			} else {
				// Reset counters for visitors still within window
				v.pasteCount = 0
				v.retrievalCount = 0
			}
		}
		rl.mu.Unlock()
	}
}

// getClientIP extracts the client IP address from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for proxies)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For can contain multiple IPs, take the first one
		if ip := parseXForwardedFor(xff); ip != "" {
			return ip
		}
	}

	// Check X-Real-IP header
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fall back to RemoteAddr
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// parseXForwardedFor parses the X-Forwarded-For header and returns the first valid IP
func parseXForwardedFor(header string) string {
	// Simple implementation: just take the first IP before comma
	for i, c := range header {
		if c == ',' {
			ip := header[:i]
			if net.ParseIP(ip) != nil {
				return ip
			}
			break
		}
	}

	// If no comma, try the whole string
	if net.ParseIP(header) != nil {
		return header
	}

	return ""
}

// GetStats returns current rate limiting statistics (for debugging)
func (rl *RateLimiter) GetStats() map[string]interface{} {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	stats := map[string]interface{}{
		"total_visitors":  len(rl.visitors),
		"paste_limit":     rl.pasteLimit,
		"retrieval_limit": rl.retrievalLimit,
		"window_hours":    rl.window.Hours(),
	}

	return stats
}
