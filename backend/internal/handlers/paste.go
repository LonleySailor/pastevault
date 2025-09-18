package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/LonleySailor/privatepaste/backend/internal/middleware"
	"github.com/LonleySailor/privatepaste/backend/internal/models"
	"github.com/LonleySailor/privatepaste/backend/pkg/utils"
	"github.com/LonleySailor/privatepaste/backend/pkg/validation"
	"github.com/gorilla/mux"
)

// PasteHandler handles paste-related HTTP requests
type PasteHandler struct {
	pasteRepo   PasteRepositoryInterface
	idGenerator *utils.IDGenerator
	validator   *validation.Validator
}

// NewPasteHandler creates a new paste handler
func NewPasteHandler(pasteRepo PasteRepositoryInterface, idGenerator *utils.IDGenerator, validator *validation.Validator) *PasteHandler {
	return &PasteHandler{
		pasteRepo:   pasteRepo,
		idGenerator: idGenerator,
		validator:   validator,
	}
}

// CreatePasteRequest represents a request to create a new paste
type CreatePasteRequest struct {
	Content  string `json:"content"`
	Password string `json:"password,omitempty"`
	Expiry   string `json:"expiry,omitempty"`   // Duration string like "1h", "30m", "7d"
	Language string `json:"language,omitempty"` // For syntax highlighting
}

// PasteResponse represents a paste response for GET requests
type PasteResponse struct {
	ID          string `json:"id"`
	Content     string `json:"content"`
	Language    string `json:"language,omitempty"`
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
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	var req CreatePasteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, ErrInvalidJSON)
		return
	}

	// Validate request
	if errors := h.validator.ValidateCreatePasteRequestFull(req.Content, req.Password, req.Expiry, req.Language); errors.HasErrors() {
		WriteValidationError(w, errors)
		return
	}

	// Check content size (1MB limit)
	if len(req.Content) > 1048576 {
		WriteError(w, ErrContentTooLarge)
		return
	}

	// Generate unique ID
	id, err := h.idGenerator.GenerateWithCollisionCheck(h.pasteRepo.Exists)
	if err != nil {
		WriteError(w, ErrIDGenerationFailed)
		return
	}

	// Create paste object
	paste := &models.Paste{
		ID:       id,
		Content:  req.Content,
		Language: req.Language,
	}

	// Handle password if provided
	if req.Password != "" {
		hashedPassword, err := utils.HashPasswordWithCost(req.Password, 12) // Use cost 12 as specified
		if err != nil {
			WriteError(w, ErrInternalServer)
			return
		}
		paste.PasswordHash = &hashedPassword
	}

	// Handle user association if authenticated
	if userID, ok := middleware.GetUserIDFromContext(r.Context()); ok {
		paste.UserID = &userID
	}

	// Handle expiry if provided
	if req.Expiry != "" {
		duration, validationErr := h.validator.ValidateExpiryDuration(req.Expiry)
		if validationErr != nil {
			WriteValidationError(w, []validation.ValidationError{*validationErr})
			return
		}
		if duration != nil {
			expiresAt := time.Now().Add(*duration)
			paste.ExpiresAt = &expiresAt
		}
	} else {
		// Default expiry: 24 hours for anonymous pastes, never for authenticated users
		if paste.UserID == nil {
			expiresAt := time.Now().Add(24 * time.Hour)
			paste.ExpiresAt = &expiresAt
		}
		// For authenticated users, default to no expiry if not specified
	}

	// Save to database
	if err := h.pasteRepo.Create(paste); err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Prepare response
	response := CreatePasteResponse{
		ID:        paste.ID,
		URL:       "https://privatepaste.example.com/" + paste.ID, // TODO: Use actual domain from config
		CreatedAt: paste.CreatedAt.Format(time.RFC3339),
	}

	if paste.ExpiresAt != nil {
		response.ExpiresAt = paste.ExpiresAt.Format(time.RFC3339)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetByID handles retrieving a paste by its ID
func (h *PasteHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_id",
			Message: "Invalid paste ID format",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Get password from query parameter if provided
	password := r.URL.Query().Get("password")

	// Retrieve paste from database
	paste, err := h.pasteRepo.GetByID(id)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if paste == nil {
		WriteError(w, ErrPasteNotFound)
		return
	}

	// Check if paste has expired
	if paste.IsExpired() {
		WriteError(w, ErrPasteExpired)
		return
	}

	// Check password protection
	if paste.HasPassword() {
		if password == "" {
			WriteError(w, ErrPasswordRequired)
			return
		}

		if err := utils.VerifyPassword(password, *paste.PasswordHash); err != nil {
			WriteError(w, ErrInvalidPassword)
			return
		}
	}

	// Prepare response
	response := PasteResponse{
		ID:          paste.ID,
		Content:     paste.Content,
		Language:    paste.Language,
		CreatedAt:   paste.CreatedAt.Format(time.RFC3339),
		HasPassword: paste.HasPassword(),
	}

	if paste.ExpiresAt != nil {
		response.ExpiresAt = paste.ExpiresAt.Format(time.RFC3339)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetRaw handles retrieving a paste's raw content
func (h *PasteHandler) GetRaw(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_id",
			Message: "Invalid paste ID format",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Get password from query parameter if provided
	password := r.URL.Query().Get("password")

	// Retrieve paste from database
	paste, err := h.pasteRepo.GetByID(id)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if paste == nil {
		WriteError(w, ErrPasteNotFound)
		return
	}

	// Check if paste has expired
	if paste.IsExpired() {
		WriteError(w, ErrPasteExpired)
		return
	}

	// Check password protection
	if paste.HasPassword() {
		if password == "" {
			WriteError(w, ErrPasswordRequired)
			return
		}

		if err := utils.VerifyPassword(password, *paste.PasswordHash); err != nil {
			WriteError(w, ErrInvalidPassword)
			return
		}
	}

	// Return raw content with appropriate headers
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(paste.Content))
}

// GetByIDWithPassword handles retrieving a password-protected paste via POST
func (h *PasteHandler) GetByIDWithPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_id",
			Message: "Invalid paste ID format",
			Status:  http.StatusBadRequest,
		})
		return
	}

	var req struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, ErrInvalidJSON)
		return
	}

	if req.Password == "" {
		WriteError(w, &APIError{
			Code:    "password_required",
			Message: "Password is required",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Retrieve paste from database
	paste, err := h.pasteRepo.GetByID(id)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if paste == nil {
		WriteError(w, ErrPasteNotFound)
		return
	}

	// Check if paste has expired
	if paste.IsExpired() {
		WriteError(w, ErrPasteExpired)
		return
	}

	// Check password protection
	if !paste.HasPassword() {
		WriteError(w, &APIError{
			Code:    "password_not_required",
			Message: "This paste is not password protected",
			Status:  http.StatusBadRequest,
		})
		return
	}

	if err := utils.VerifyPassword(req.Password, *paste.PasswordHash); err != nil {
		WriteError(w, ErrInvalidPassword)
		return
	}

	// Prepare response
	response := PasteResponse{
		ID:          paste.ID,
		Content:     paste.Content,
		Language:    paste.Language,
		CreatedAt:   paste.CreatedAt.Format(time.RFC3339),
		HasPassword: paste.HasPassword(),
	}

	if paste.ExpiresAt != nil {
		response.ExpiresAt = paste.ExpiresAt.Format(time.RFC3339)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Delete handles deleting a paste (requires authentication)
func (h *PasteHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Extract ID from URL path
	vars := mux.Vars(r)
	id := vars["id"]

	// Validate ID format
	if err := h.validator.ValidateID(id); err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_id",
			Message: "Invalid paste ID format",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Check if paste exists
	paste, err := h.pasteRepo.GetByID(id)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if paste == nil {
		WriteError(w, ErrPasteNotFound)
		return
	}

	// Check if user owns the paste
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		WriteError(w, &APIError{
			Code:    "unauthorized",
			Message: "Authentication required",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	if paste.UserID == nil || *paste.UserID != userID {
		WriteError(w, &APIError{
			Code:    "forbidden",
			Message: "You can only delete your own pastes",
			Status:  http.StatusForbidden,
		})
		return
	}

	// Delete the paste
	if err := h.pasteRepo.Delete(id); err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UserPastesResponse represents a paginated list of user pastes
type UserPastesResponse struct {
	Pastes []PasteListItem `json:"pastes"`
	Total  int             `json:"total"`
	Page   int             `json:"page"`
	Limit  int             `json:"limit"`
}

// PasteListItem represents a paste in a list (without content)
type PasteListItem struct {
	ID          string `json:"id"`
	Language    string `json:"language,omitempty"`
	CreatedAt   string `json:"created_at"`
	ExpiresAt   string `json:"expires_at,omitempty"`
	HasPassword bool   `json:"has_password"`
	Size        int    `json:"size"`
}

// GetUserPastes handles retrieving all pastes for the authenticated user
func (h *PasteHandler) GetUserPastes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// Extract user ID from context (set by auth middleware)
	userID, ok := middleware.GetUserIDFromContext(r.Context())
	if !ok {
		WriteError(w, &APIError{
			Code:    "unauthorized",
			Message: "User ID not found in token",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	// Parse pagination parameters
	page := 1
	limit := 20

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	offset := (page - 1) * limit

	// Get user's pastes
	pastes, err := h.pasteRepo.GetByUserID(userID, limit, offset)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Get total count
	total, err := h.pasteRepo.CountByUserID(userID)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Convert to list items
	pasteItems := make([]PasteListItem, len(pastes))
	for i, paste := range pastes {
		item := PasteListItem{
			ID:          paste.ID,
			Language:    paste.Language,
			CreatedAt:   paste.CreatedAt.Format(time.RFC3339),
			HasPassword: paste.HasPassword(),
			Size:        len(paste.Content),
		}

		if paste.ExpiresAt != nil {
			item.ExpiresAt = paste.ExpiresAt.Format(time.RFC3339)
		}

		pasteItems[i] = item
	}

	// Prepare response
	response := UserPastesResponse{
		Pastes: pasteItems,
		Total:  total,
		Page:   page,
		Limit:  limit,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
