package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/LonleySailor/pastevault/backend/internal/auth"
	"github.com/LonleySailor/pastevault/backend/internal/middleware"
	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/utils"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userRepo     *models.UserRepository
	tokenManager *auth.TokenManager
	validator    *validation.Validator
}

// NewUserHandler creates a new user handler
func NewUserHandler(userRepo *models.UserRepository, tokenManager *auth.TokenManager, validator *validation.Validator) *UserHandler {
	return &UserHandler{
		userRepo:     userRepo,
		tokenManager: tokenManager,
		validator:    validator,
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

// RefreshTokenRequest represents a refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// UserResponse represents a user response (without sensitive data)
type UserResponse struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

// AuthResponse represents an authentication response
type AuthResponse struct {
	User      UserResponse    `json:"user"`
	TokenPair *auth.TokenPair `json:"tokens"`
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, ErrInvalidJSON)
		return
	}

	// Validate request
	if errors := h.validator.ValidateUserRegistrationRequest(req.Username, req.Password); errors.HasErrors() {
		WriteValidationError(w, errors)
		return
	}

	// Check if username already exists
	exists, err := h.userRepo.Exists(req.Username)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}
	if exists {
		WriteError(w, &APIError{
			Code:    "username_exists",
			Message: "Username already exists",
			Status:  http.StatusConflict,
		})
		return
	}

	// Hash password with cost factor 14 as specified in Phase 4
	hashedPassword, err := utils.HashPasswordWithCost(req.Password, 14)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Create user
	user := &models.User{
		Username:     req.Username,
		PasswordHash: hashedPassword,
	}

	if err := h.userRepo.Create(user); err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Generate tokens
	tokenPair, err := h.tokenManager.GenerateTokenPair(user.ID, user.Username)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Prepare response
	response := AuthResponse{
		User: UserResponse{
			ID:       user.ID,
			Username: user.Username,
		},
		TokenPair: tokenPair,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, ErrInvalidJSON)
		return
	}

	// Basic validation
	if req.Username == "" || req.Password == "" {
		WriteError(w, &APIError{
			Code:    "validation_failed",
			Message: "Username and password required",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Get user by username
	user, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if user == nil {
		WriteError(w, &APIError{
			Code:    "invalid_credentials",
			Message: "Invalid username or password",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	// Verify password
	if err := utils.VerifyPassword(req.Password, user.PasswordHash); err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_credentials",
			Message: "Invalid username or password",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	// Generate tokens
	tokenPair, err := h.tokenManager.GenerateTokenPair(user.ID, user.Username)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	// Prepare response
	response := AuthResponse{
		User: UserResponse{
			ID:       user.ID,
			Username: user.Username,
		},
		TokenPair: tokenPair,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// RefreshToken handles refreshing access tokens
func (h *UserHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	var req RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, ErrInvalidJSON)
		return
	}

	if req.RefreshToken == "" {
		WriteError(w, &APIError{
			Code:    "validation_failed",
			Message: "Refresh token required",
			Status:  http.StatusBadRequest,
		})
		return
	}

	// Validate refresh token
	claims, err := h.tokenManager.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		WriteError(w, &APIError{
			Code:    "invalid_token",
			Message: "Invalid refresh token",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	// Get user to ensure they still exist
	user, err := h.userRepo.GetByID(claims.UserID)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if user == nil {
		WriteError(w, &APIError{
			Code:    "user_not_found",
			Message: "User not found",
			Status:  http.StatusUnauthorized,
		})
		return
	}

	// Generate new token pair
	tokenPair, err := h.tokenManager.GenerateTokenPair(user.ID, user.Username)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(tokenPair)
}

// Logout handles user logout (placeholder for token blacklisting)
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		WriteError(w, &APIError{
			Code:    "method_not_allowed",
			Message: "Method not allowed",
			Status:  http.StatusMethodNotAllowed,
		})
		return
	}

	// For now, logout is just a placeholder since we don't have token blacklisting
	// In a production system, you'd want to invalidate the token
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Logged out successfully",
	})
}

// GetProfile handles getting user profile (requires authentication)
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
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

	// Get user from database
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		WriteError(w, ErrInternalServer)
		return
	}

	if user == nil {
		WriteError(w, &APIError{
			Code:    "user_not_found",
			Message: "User not found",
			Status:  http.StatusNotFound,
		})
		return
	}

	// Prepare response
	response := UserResponse{
		ID:       user.ID,
		Username: user.Username,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
