package validation

import (
	"testing"
	"time"
)

func TestValidateExpiryDuration(t *testing.T) {
	validator := NewValidator()

	testCases := []struct {
		name             string
		input            string
		expectedError    bool
		expectedDuration *time.Duration
	}{
		{
			name:             "Empty string",
			input:            "",
			expectedError:    false,
			expectedDuration: nil,
		},
		{
			name:             "Never",
			input:            "never",
			expectedError:    false,
			expectedDuration: nil,
		},
		{
			name:             "1 hour",
			input:            "1h",
			expectedError:    false,
			expectedDuration: func() *time.Duration { d := time.Hour; return &d }(),
		},
		{
			name:             "30 minutes",
			input:            "30m",
			expectedError:    false,
			expectedDuration: func() *time.Duration { d := 30 * time.Minute; return &d }(),
		},
		{
			name:             "7 days",
			input:            "7d",
			expectedError:    false,
			expectedDuration: func() *time.Duration { d := 7 * 24 * time.Hour; return &d }(),
		},
		{
			name:             "1 day",
			input:            "1d",
			expectedError:    false,
			expectedDuration: func() *time.Duration { d := 24 * time.Hour; return &d }(),
		},
		{
			name:             "Invalid format",
			input:            "invalid",
			expectedError:    true,
			expectedDuration: nil,
		},
		{
			name:             "Too short duration",
			input:            "30s",
			expectedError:    true,
			expectedDuration: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			duration, err := validator.ValidateExpiryDuration(tc.input)

			if tc.expectedError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}

				if tc.expectedDuration == nil && duration != nil {
					t.Errorf("Expected nil duration but got %v", *duration)
				} else if tc.expectedDuration != nil && duration == nil {
					t.Errorf("Expected duration %v but got nil", *tc.expectedDuration)
				} else if tc.expectedDuration != nil && duration != nil && *tc.expectedDuration != *duration {
					t.Errorf("Expected duration %v but got %v", *tc.expectedDuration, *duration)
				}
			}
		})
	}
}

func TestValidateCreatePasteRequestFull(t *testing.T) {
	validator := NewValidator()

	testCases := []struct {
		name           string
		content        string
		password       string
		expiry         string
		language       string
		expectedErrors int
	}{
		{
			name:           "Valid request",
			content:        "Hello, World!",
			password:       "secret123",
			expiry:         "1h",
			language:       "javascript",
			expectedErrors: 0,
		},
		{
			name:           "Empty content",
			content:        "",
			password:       "",
			expiry:         "",
			language:       "",
			expectedErrors: 1, // content is required
		},
		{
			name:           "Short password",
			content:        "Valid content",
			password:       "123",
			expiry:         "",
			language:       "",
			expectedErrors: 1, // password too short
		},
		{
			name:           "Invalid expiry",
			content:        "Valid content",
			password:       "",
			expiry:         "invalid",
			language:       "",
			expectedErrors: 1, // invalid expiry format
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			errors := validator.ValidateCreatePasteRequestFull(tc.content, tc.password, tc.expiry, tc.language)

			if len(errors) != tc.expectedErrors {
				t.Errorf("Expected %d errors but got %d: %v", tc.expectedErrors, len(errors), errors)
			}
		})
	}
}

func TestValidateID(t *testing.T) {
	validator := NewValidator()

	testCases := []struct {
		name          string
		id            string
		expectedError bool
	}{
		{
			name:          "Valid ID",
			id:            "abc123",
			expectedError: false,
		},
		{
			name:          "Valid ID with uppercase",
			id:            "ABC123",
			expectedError: false,
		},
		{
			name:          "Too short",
			id:            "abc12",
			expectedError: true,
		},
		{
			name:          "Too long",
			id:            "abc1234",
			expectedError: true,
		},
		{
			name:          "Invalid characters",
			id:            "abc@12",
			expectedError: true,
		},
		{
			name:          "Empty",
			id:            "",
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := validator.ValidateID(tc.id)

			if tc.expectedError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
			}
		})
	}
}
