package utils

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	// Test password hashing
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	if hash == "" {
		t.Error("Hash should not be empty")
	}

	if hash == password {
		t.Error("Hash should not be the same as the original password")
	}

	// Test password verification
	err = VerifyPassword(password, hash)
	if err != nil {
		t.Errorf("Failed to verify correct password: %v", err)
	}

	// Test wrong password
	err = VerifyPassword("wrongpassword", hash)
	if err == nil {
		t.Error("Should fail to verify wrong password")
	}
}

func TestHashPasswordEmpty(t *testing.T) {
	// Test empty password
	_, err := HashPassword("")
	if err == nil {
		t.Error("Should fail to hash empty password")
	}
}

func TestVerifyPasswordEmpty(t *testing.T) {
	// Test empty password
	err := VerifyPassword("", "somehash")
	if err == nil {
		t.Error("Should fail to verify empty password")
	}

	// Test empty hash
	err = VerifyPassword("password", "")
	if err == nil {
		t.Error("Should fail to verify with empty hash")
	}
}

func TestIsValidPassword(t *testing.T) {
	// Test valid passwords
	validPasswords := []string{
		"password",
		"123456",
		"very-long-password-with-special-chars!@#$%",
	}

	for _, password := range validPasswords {
		if !IsValidPassword(password) {
			t.Errorf("Valid password %s was marked as invalid", password)
		}
	}

	// Test invalid passwords
	invalidPasswords := []string{
		"",      // empty
		"12345", // too short
	}

	for _, password := range invalidPasswords {
		if IsValidPassword(password) {
			t.Errorf("Invalid password %s was marked as valid", password)
		}
	}

	// Test extremely long password
	longPassword := ""
	for i := 0; i < 200; i++ {
		longPassword += "a"
	}
	if IsValidPassword(longPassword) {
		t.Error("Extremely long password should be invalid")
	}
}

func TestHashPasswordWithCost(t *testing.T) {
	password := "testpassword"

	// Test with valid cost
	hash, err := HashPasswordWithCost(password, 10)
	if err != nil {
		t.Fatalf("Failed to hash password with cost: %v", err)
	}

	// Verify the hash works
	err = VerifyPassword(password, hash)
	if err != nil {
		t.Errorf("Failed to verify password hashed with custom cost: %v", err)
	}

	// Test with invalid cost (too low)
	_, err = HashPasswordWithCost(password, 3)
	if err == nil {
		t.Error("Should fail with cost too low")
	}

	// Test with invalid cost (too high)
	_, err = HashPasswordWithCost(password, 32)
	if err == nil {
		t.Error("Should fail with cost too high")
	}
}
