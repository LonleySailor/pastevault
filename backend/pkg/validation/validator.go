package validation

import (
	"fmt"
	"strings"
	"time"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidationErrors represents multiple validation errors
type ValidationErrors []ValidationError

func (e ValidationErrors) Error() string {
	if len(e) == 0 {
		return ""
	}

	var messages []string
	for _, err := range e {
		messages = append(messages, err.Error())
	}
	return strings.Join(messages, "; ")
}

// HasErrors returns true if there are validation errors
func (e ValidationErrors) HasErrors() bool {
	return len(e) > 0
}

// Add adds a new validation error
func (e *ValidationErrors) Add(field, message string) {
	*e = append(*e, ValidationError{Field: field, Message: message})
}

// Validator provides validation utilities
type Validator struct{}

// NewValidator creates a new validator instance
func NewValidator() *Validator {
	return &Validator{}
}

// ValidateString validates string fields with various constraints
func (v *Validator) ValidateString(value, fieldName string, required bool, minLen, maxLen int) *ValidationError {
	if required && value == "" {
		return &ValidationError{Field: fieldName, Message: "is required"}
	}

	if value == "" && !required {
		return nil // Optional field, no validation needed
	}

	if len(value) < minLen {
		return &ValidationError{Field: fieldName, Message: fmt.Sprintf("must be at least %d characters", minLen)}
	}

	if maxLen > 0 && len(value) > maxLen {
		return &ValidationError{Field: fieldName, Message: fmt.Sprintf("must be at most %d characters", maxLen)}
	}

	return nil
}

// ValidateUsername validates username format and constraints
func (v *Validator) ValidateUsername(username string) *ValidationError {
	if err := v.ValidateString(username, "username", true, 3, 50); err != nil {
		return err
	}

	// Check for valid characters (alphanumeric, underscore, hyphen)
	for _, char := range username {
		if !((char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') ||
			char == '_' || char == '-') {
			return &ValidationError{Field: "username", Message: "can only contain letters, numbers, underscores, and hyphens"}
		}
	}

	return nil
}

// ValidatePassword validates password strength
func (v *Validator) ValidatePassword(password string) *ValidationError {
	if err := v.ValidateString(password, "password", true, 6, 128); err != nil {
		return err
	}

	// Additional password strength checks can be added here
	// For now, we just check basic length requirements

	return nil
}

// ValidatePasteContent validates paste content
func (v *Validator) ValidatePasteContent(content string) *ValidationError {
	if err := v.ValidateString(content, "content", true, 1, 1000000); err != nil { // 1MB limit
		return err
	}

	return nil
}

// ValidateExpiryDuration validates expiry duration strings
func (v *Validator) ValidateExpiryDuration(duration string) (*time.Duration, *ValidationError) {
	if duration == "" {
		return nil, nil // No expiry
	}

	// Parse duration
	d, err := time.ParseDuration(duration)
	if err != nil {
		return nil, &ValidationError{Field: "expires_in", Message: "invalid duration format (use format like '1h', '30m', '1d')"}
	}

	// Check minimum duration (1 minute)
	if d < time.Minute {
		return nil, &ValidationError{Field: "expires_in", Message: "expiry duration must be at least 1 minute"}
	}

	// Check maximum duration (1 year)
	if d > 365*24*time.Hour {
		return nil, &ValidationError{Field: "expires_in", Message: "expiry duration cannot exceed 1 year"}
	}

	return &d, nil
}

// ValidateID validates paste ID format
func (v *Validator) ValidateID(id string) *ValidationError {
	if err := v.ValidateString(id, "id", true, 6, 6); err != nil {
		return err
	}

	// Check for valid characters (alphanumeric only)
	for _, char := range id {
		if !((char >= 'a' && char <= 'z') ||
			(char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9')) {
			return &ValidationError{Field: "id", Message: "can only contain letters and numbers"}
		}
	}

	return nil
}

// ValidateCreatePasteRequest validates a create paste request
func (v *Validator) ValidateCreatePasteRequest(content, password, expiresIn string) ValidationErrors {
	var errors ValidationErrors

	// Validate content
	if err := v.ValidatePasteContent(content); err != nil {
		errors.Add(err.Field, err.Message)
	}

	// Validate password if provided
	if password != "" {
		if err := v.ValidatePassword(password); err != nil {
			errors.Add(err.Field, err.Message)
		}
	}

	// Validate expiry duration if provided
	if expiresIn != "" {
		if _, err := v.ValidateExpiryDuration(expiresIn); err != nil {
			errors.Add(err.Field, err.Message)
		}
	}

	return errors
}

// ValidateUserRegistrationRequest validates a user registration request
func (v *Validator) ValidateUserRegistrationRequest(username, password string) ValidationErrors {
	var errors ValidationErrors

	// Validate username
	if err := v.ValidateUsername(username); err != nil {
		errors.Add(err.Field, err.Message)
	}

	// Validate password
	if err := v.ValidatePassword(password); err != nil {
		errors.Add(err.Field, err.Message)
	}

	return errors
}
