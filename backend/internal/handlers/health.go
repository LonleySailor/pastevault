package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

// HealthHandler handles health check endpoints
type HealthHandler struct {
	db *sql.DB
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{
		db: db,
	}
}

// BasicHealthResponse represents basic health check response
type BasicHealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
}

// DetailedHealthResponse represents detailed health check response
type DetailedHealthResponse struct {
	Status      string                 `json:"status"`
	Version     string                 `json:"version"`
	Timestamp   string                 `json:"timestamp"`
	Uptime      string                 `json:"uptime"`
	Database    DatabaseHealth         `json:"database"`
	Memory      MemoryHealth           `json:"memory"`
	Environment map[string]interface{} `json:"environment"`
}

// DatabaseHealth represents database health information
type DatabaseHealth struct {
	Status      string `json:"status"`
	Ping        bool   `json:"ping"`
	Connections int    `json:"connections"`
}

// MemoryHealth represents memory health information
type MemoryHealth struct {
	Status string `json:"status"`
}

var startTime = time.Now()

// BasicHealth handles basic health check endpoint
func (h *HealthHandler) BasicHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	response := BasicHealthResponse{
		Status:  "healthy",
		Version: "1.0.0",
	}

	// Check database health
	if err := h.db.Ping(); err != nil {
		response.Status = "unhealthy"
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DetailedHealth handles detailed health check endpoint
func (h *HealthHandler) DetailedHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Check database health
	dbHealth := DatabaseHealth{
		Status: "healthy",
		Ping:   true,
	}

	if err := h.db.Ping(); err != nil {
		dbHealth.Status = "unhealthy"
		dbHealth.Ping = false
	}

	// Get database stats
	stats := h.db.Stats()
	dbHealth.Connections = stats.OpenConnections

	// Determine overall status
	overallStatus := "healthy"
	if dbHealth.Status != "healthy" {
		overallStatus = "unhealthy"
	}

	response := DetailedHealthResponse{
		Status:    overallStatus,
		Version:   "1.0.0",
		Timestamp: time.Now().Format(time.RFC3339),
		Uptime:    time.Since(startTime).String(),
		Database:  dbHealth,
		Memory: MemoryHealth{
			Status: "healthy",
		},
		Environment: map[string]interface{}{
			"go_version": "1.25.1",
			"started_at": startTime.Format(time.RFC3339),
		},
	}

	if overallStatus == "unhealthy" {
		w.WriteHeader(http.StatusServiceUnavailable)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
