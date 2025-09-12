package utils

import (
	"testing"
)

func TestIDGeneration(t *testing.T) {
	generator := NewIDGenerator()

	// Test basic ID generation
	id, err := generator.Generate()
	if err != nil {
		t.Fatalf("Failed to generate ID: %v", err)
	}

	// Test ID length
	if len(id) != IDLength {
		t.Errorf("Expected ID length %d, got %d", IDLength, len(id))
	}

	// Test ID format
	if !generator.IsValidID(id) {
		t.Errorf("Generated ID %s is not valid", id)
	}

	// Test uniqueness (generate multiple IDs)
	ids := make(map[string]bool)
	for i := 0; i < 1000; i++ {
		id, err := generator.Generate()
		if err != nil {
			t.Fatalf("Failed to generate ID at iteration %d: %v", i, err)
		}
		if ids[id] {
			t.Errorf("Duplicate ID generated: %s", id)
		}
		ids[id] = true
	}
}

func TestValidateID(t *testing.T) {
	generator := NewIDGenerator()

	// Test valid IDs
	validIDs := []string{"abc123", "XYZ789", "A1B2C3"}
	for _, id := range validIDs {
		if !generator.IsValidID(id) {
			t.Errorf("Valid ID %s was marked as invalid", id)
		}
	}

	// Test invalid IDs
	invalidIDs := []string{
		"",        // empty
		"abc",     // too short
		"abc1234", // too long
		"abc@12",  // invalid character
		"abc 12",  // space
	}
	for _, id := range invalidIDs {
		if generator.IsValidID(id) {
			t.Errorf("Invalid ID %s was marked as valid", id)
		}
	}
}

func TestGenerateWithCollisionCheck(t *testing.T) {
	generator := NewIDGenerator()
	existingIDs := map[string]bool{
		"abc123": true,
		"def456": true,
	}

	existsChecker := func(id string) (bool, error) {
		return existingIDs[id], nil
	}

	// Generate ID that should not collide
	id, err := generator.GenerateWithCollisionCheck(existsChecker)
	if err != nil {
		t.Fatalf("Failed to generate ID with collision check: %v", err)
	}

	if existingIDs[id] {
		t.Errorf("Generated ID %s collides with existing ID", id)
	}
}
