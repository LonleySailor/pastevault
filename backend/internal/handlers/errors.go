package handlers

import (
	"encoding/json"
	"net/http"
)

// APIError represents a custom API error response
type APIError struct {
	Code    string `json:"error"`
	Message string `json:"message"`
	Status  int    `json:"-"`
}

// Error implements the error interface
func (e *APIError) Error() string {
	return e.Message
}

// WriteError writes an API error response to the HTTP response writer
func WriteError(w http.ResponseWriter, err *APIError) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(err.Status)
	json.NewEncoder(w).Encode(err)
}

// Predefined API errors
var (
	ErrInvalidJSON = &APIError{
		Code:    "invalid_json",
		Message: "Invalid JSON in request body",
		Status:  http.StatusBadRequest,
	}

	ErrValidationFailed = &APIError{
		Code:    "validation_failed",
		Message: "Validation failed",
		Status:  http.StatusBadRequest,
	}

	ErrContentTooLarge = &APIError{
		Code:    "content_too_large",
		Message: "Content exceeds maximum size limit",
		Status:  http.StatusRequestEntityTooLarge,
	}

	ErrPasteNotFound = &APIError{
		Code:    "paste_not_found",
		Message: "Paste not found",
		Status:  http.StatusNotFound,
	}

	ErrPasteExpired = &APIError{
		Code:    "paste_expired",
		Message: "Paste has expired",
		Status:  http.StatusGone,
	}

	ErrPasswordRequired = &APIError{
		Code:    "password_required",
		Message: "This paste is password protected",
		Status:  http.StatusUnauthorized,
	}

	ErrInvalidPassword = &APIError{
		Code:    "invalid_password",
		Message: "Invalid password",
		Status:  http.StatusForbidden,
	}

	ErrInternalServer = &APIError{
		Code:    "internal_server_error",
		Message: "Internal server error",
		Status:  http.StatusInternalServerError,
	}

	ErrIDGenerationFailed = &APIError{
		Code:    "id_generation_failed",
		Message: "Failed to generate unique paste ID",
		Status:  http.StatusInternalServerError,
	}
)

// NewValidationError creates a validation error with custom details
func NewValidationError(details interface{}) *APIError {
	return &APIError{
		Code:    "validation_failed",
		Message: "Validation failed",
		Status:  http.StatusBadRequest,
	}
}

// WriteValidationError writes a validation error with details
func WriteValidationError(w http.ResponseWriter, details interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"error":   "validation_failed",
		"message": "Validation failed",
		"details": details,
	})
}
