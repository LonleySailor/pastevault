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
	if err := v.ValidateString(password, "password", true, 8, 128); err != nil {
		return err
	}

	// Password strength checks as per Phase 4 requirements
	var hasUpper, hasLower, hasNumber bool

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasNumber = true
		}
	}

	if !hasUpper {
		return &ValidationError{Field: "password", Message: "must contain at least one uppercase letter"}
	}
	if !hasLower {
		return &ValidationError{Field: "password", Message: "must contain at least one lowercase letter"}
	}
	if !hasNumber {
		return &ValidationError{Field: "password", Message: "must contain at least one number"}
	}

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

	// Handle special case for "never"
	if duration == "never" {
		return nil, nil
	}

	// Handle common duration formats like "1h", "24h", "7d"
	// Convert "d" (days) to hours since Go doesn't support days directly
	if len(duration) > 1 && duration[len(duration)-1:] == "d" {
		dayStr := duration[:len(duration)-1]
		// Parse the number of days
		var days int
		if _, err := fmt.Sscanf(dayStr, "%d", &days); err != nil {
			return nil, &ValidationError{Field: "expiry", Message: "invalid duration format (use format like '1h', '30m', '7d', or 'never')"}
		}
		// Convert days to hours (multiply by 24)
		hours := time.Duration(days) * 24 * time.Hour

		// Check maximum duration (1 year)
		if hours > 365*24*time.Hour {
			return nil, &ValidationError{Field: "expiry", Message: "expiry duration cannot exceed 1 year"}
		}

		return &hours, nil
	}

	// Parse standard Go duration format
	d, err := time.ParseDuration(duration)
	if err != nil {
		return nil, &ValidationError{Field: "expiry", Message: "invalid duration format (use format like '1h', '30m', '7d', or 'never')"}
	}

	// Check minimum duration (1 minute)
	if d < time.Minute {
		return nil, &ValidationError{Field: "expiry", Message: "expiry duration must be at least 1 minute"}
	}

	// Check maximum duration (1 year)
	if d > 365*24*time.Hour {
		return nil, &ValidationError{Field: "expiry", Message: "expiry duration cannot exceed 1 year"}
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

// ValidateLanguage validates the language field for syntax highlighting
func (v *Validator) ValidateLanguage(language string) *ValidationError {
	if language == "" {
		return nil // Optional field
	}

	// For now, accept any string (as requested)
	// Basic validation: length and no control characters
	if len(language) > 50 {
		return &ValidationError{Field: "language", Message: "must be at most 50 characters"}
	}

	// Check for control characters
	for _, char := range language {
		if char < 32 && char != 9 && char != 10 && char != 13 { // Allow tab, newline, carriage return
			return &ValidationError{Field: "language", Message: "cannot contain control characters"}
		}
	}

	return nil
}

// ValidateCreatePasteRequestFull validates a create paste request with all fields
func (v *Validator) ValidateCreatePasteRequestFull(content, password, expiry, language string) ValidationErrors {
	var errors ValidationErrors

	// Validate content
	if err := v.ValidatePasteContent(content); err != nil {
		errors.Add(err.Field, err.Message)
	}

	// Validate password if provided
	if password != "" {
		// For paste passwords, we have a minimum of 4 characters (different from user passwords)
		if len(password) < 4 {
			errors.Add("password", "must be at least 4 characters")
		}
		if len(password) > 128 {
			errors.Add("password", "must be at most 128 characters")
		}
	}

	// Validate expiry duration if provided
	if expiry != "" {
		if _, err := v.ValidateExpiryDuration(expiry); err != nil {
			errors.Add(err.Field, err.Message)
		}
	}

	// Validate language if provided
	if err := v.ValidateLanguage(language); err != nil {
		errors.Add(err.Field, err.Message)
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
