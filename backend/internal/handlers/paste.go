package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/utils"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
	"github.com/gorilla/mux"
)

// PasteHandler handles paste-related HTTP requests
type PasteHandler struct {
	pasteRepo   *models.PasteRepository
	idGenerator *utils.IDGenerator
	validator   *validation.Validator
}

// NewPasteHandler creates a new paste handler
func NewPasteHandler(pasteRepo *models.PasteRepository, idGenerator *utils.IDGenerator, validator *validation.Validator) *PasteHandler {
	return &PasteHandler{
		pasteRepo:   pasteRepo,
		idGenerator: idGenerator,
		validator:   validator,
	}
}

// CreatePasteRequest represents a request to create a new paste
type CreatePasteRequest struct {
	Content   string `json:"content"`
	Password  string `json:"password,omitempty"`
	ExpiresIn string `json:"expires_in,omitempty"` // Duration string like "1h", "30m", "1d"
}

// PasteResponse represents a paste response
type PasteResponse struct {
	ID          string `json:"id"`
	Content     string `json:"content"`
	CreatedAt   string `json:"created_at"`
	ExpiresAt   string `json:"expires_at,omitempty"`
	HasPassword bool   `json:"has_password"`
}

// CreatePasteResponse represents the response when creating a paste
type CreatePasteResponse struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at,omitempty"`
}

// Create handles creating a new paste
func (h *PasteHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CreatePasteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate request
	if errors := h.validator.ValidateCreatePasteRequest(req.Content, req.Password, req.ExpiresIn); errors.HasErrors() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation failed",
			"errors": errors,
		})
		return
	}

	// TODO: Implement paste creation logic
	// This will be implemented in Phase 2 when we add the actual paste creation and retrieval logic
	http.Error(w, "Paste creation not yet implemented", http.StatusNotImplemented)
}

// GetByID handles retrieving a paste by its ID
func (h *PasteHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		http.Error(w, "Invalid paste ID format", http.StatusBadRequest)
		return
	}

	// TODO: Implement paste retrieval logic
	// This will be implemented in Phase 2 when we add the actual paste creation and retrieval logic
	http.Error(w, "Paste retrieval not yet implemented", http.StatusNotImplemented)
}

// GetByIDWithPassword handles retrieving a password-protected paste
func (h *PasteHandler) GetByIDWithPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		http.Error(w, "Invalid paste ID format", http.StatusBadRequest)
		return
	}

	var req struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Password == "" {
		http.Error(w, "Password required", http.StatusBadRequest)
		return
	}

	// TODO: Implement password-protected paste retrieval logic
	// This will be implemented in Phase 2 when we add the actual paste creation and retrieval logic
	http.Error(w, "Password-protected paste retrieval not yet implemented", http.StatusNotImplemented)
}

// Delete handles deleting a paste (requires authentication)
func (h *PasteHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		http.Error(w, "Invalid paste ID format", http.StatusBadRequest)
		return
	}

	// TODO: Implement paste deletion logic
	// This will be implemented in Phase 2 when we add the actual paste creation and retrieval logic
	http.Error(w, "Paste deletion not yet implemented", http.StatusNotImplemented)
}
