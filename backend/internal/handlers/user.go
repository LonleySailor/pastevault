package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userRepo  *models.UserRepository
	validator *validation.Validator
}

// NewUserHandler creates a new user handler
func NewUserHandler(userRepo *models.UserRepository, validator *validation.Validator) *UserHandler {
	return &UserHandler{
		userRepo:  userRepo,
		validator: validator,
	}
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// UserResponse represents a user response (without sensitive data)
type UserResponse struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate request
	if errors := h.validator.ValidateUserRegistrationRequest(req.Username, req.Password); errors.HasErrors() {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error":  "Validation failed",
			"errors": errors,
		})
		return
	}

	// Check if username already exists
	exists, err := h.userRepo.Exists(req.Username)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	// TODO: Hash password and create user
	// This will be implemented in Phase 2 when we add proper authentication
	http.Error(w, "User registration not yet implemented", http.StatusNotImplemented)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Basic validation
	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password required", http.StatusBadRequest)
		return
	}

	// TODO: Implement login logic with JWT token generation
	// This will be implemented in Phase 2 when we add proper authentication
	http.Error(w, "User login not yet implemented", http.StatusNotImplemented)
}

// GetProfile handles getting user profile (requires authentication)
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// TODO: Extract user ID from JWT token and return user profile
	// This will be implemented in Phase 2 when we add proper authentication
	http.Error(w, "Get profile not yet implemented", http.StatusNotImplemented)
}
