package utils

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

const (
	// IDLength is the length of generated paste IDs
	IDLength = 6
	// Charset contains all characters used for ID generation
	Charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

// IDGenerator provides methods for generating unique IDs
type IDGenerator struct {
	charset string
	length  int
}

// NewIDGenerator creates a new ID generator
func NewIDGenerator() *IDGenerator {
	return &IDGenerator{
		charset: Charset,
		length:  IDLength,
	}
}

// Generate creates a new random ID
func (g *IDGenerator) Generate() (string, error) {
	result := make([]byte, g.length)
	charsetLen := big.NewInt(int64(len(g.charset)))

	for i := range result {
		randomIndex, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", fmt.Errorf("failed to generate random number: %w", err)
		}
		result[i] = g.charset[randomIndex.Int64()]
	}

	return string(result), nil
}

// GenerateWithCollisionCheck generates a unique ID by checking against a collision checker
func (g *IDGenerator) GenerateWithCollisionCheck(existsChecker func(string) (bool, error)) (string, error) {
	const maxRetries = 10

	for i := 0; i < maxRetries; i++ {
		id, err := g.Generate()
		if err != nil {
			return "", err
		}

		exists, err := existsChecker(id)
		if err != nil {
			return "", fmt.Errorf("failed to check ID collision: %w", err)
		}

		if !exists {
			return id, nil
		}
	}

	return "", fmt.Errorf("failed to generate unique ID after %d retries", maxRetries)
}

// IsValidID checks if an ID matches the expected format
func (g *IDGenerator) IsValidID(id string) bool {
	if len(id) != g.length {
		return false
	}

	for _, char := range id {
		found := false
		for _, validChar := range g.charset {
			if char == validChar {
				found = true
				break
			}
		}
		if !found {
			return false
		}
	}

	return true
}

// GetLength returns the length of generated IDs
func (g *IDGenerator) GetLength() int {
	return g.length
}

// GetCharset returns the charset used for ID generation
func (g *IDGenerator) GetCharset() string {
	return g.charset
}
