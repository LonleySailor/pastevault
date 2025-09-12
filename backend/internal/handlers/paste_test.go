package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/utils"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
	"github.com/gorilla/mux"
)

// MockPasteRepository implements a mock paste repository for testing
type MockPasteRepository struct {
	pastes map[string]*models.Paste
}

func NewMockPasteRepository() *MockPasteRepository {
	return &MockPasteRepository{
		pastes: make(map[string]*models.Paste),
	}
}

func (r *MockPasteRepository) Create(paste *models.Paste) error {
	paste.CreatedAt = time.Now()
	r.pastes[paste.ID] = paste
	return nil
}

func (r *MockPasteRepository) GetByID(id string) (*models.Paste, error) {
	paste, exists := r.pastes[id]
	if !exists {
		return nil, nil
	}
	return paste, nil
}

func (r *MockPasteRepository) Exists(id string) (bool, error) {
	_, exists := r.pastes[id]
	return exists, nil
}

func (r *MockPasteRepository) Delete(id string) error {
	delete(r.pastes, id)
	return nil
}

func (r *MockPasteRepository) GetByUserID(userID int, limit, offset int) ([]*models.Paste, error) {
	return nil, nil
}

func (r *MockPasteRepository) Update(paste *models.Paste) error {
	r.pastes[paste.ID] = paste
	return nil
}

func (r *MockPasteRepository) DeleteExpired() (int64, error) {
	return 0, nil
}

func setupTestHandler() (*PasteHandler, *MockPasteRepository) {
	mockRepo := NewMockPasteRepository()
	idGenerator := utils.NewIDGenerator()
	validator := validation.NewValidator()

	handler := NewPasteHandler(mockRepo, idGenerator, validator)
	return handler, mockRepo
}

func TestCreatePaste_Success(t *testing.T) {
	handler, _ := setupTestHandler()

	reqBody := CreatePasteRequest{
		Content:  "Hello, World!",
		Language: "text",
		Expiry:   "1h",
	}

	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/api/paste", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler.Create(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, rr.Code)
	}

	var response CreatePasteResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.ID == "" {
		t.Error("Expected non-empty ID in response")
	}

	if response.URL == "" {
		t.Error("Expected non-empty URL in response")
	}
}

func TestCreatePaste_WithPassword(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	reqBody := CreatePasteRequest{
		Content:  "Secret content",
		Password: "secret123",
		Language: "text",
	}

	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/api/paste", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	handler.Create(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, rr.Code)
	}

	// Verify paste was created with password
	var response CreatePasteResponse
	json.Unmarshal(rr.Body.Bytes(), &response)

	paste, _ := mockRepo.GetByID(response.ID)

	if paste.PasswordHash == nil {
		t.Error("Expected paste to have password hash")
	}
}

func TestCreatePaste_ValidationErrors(t *testing.T) {
	handler, _ := setupTestHandler()

	testCases := []struct {
		name           string
		request        CreatePasteRequest
		expectedStatus int
	}{
		{
			name:           "Empty content",
			request:        CreatePasteRequest{Content: ""},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Short password",
			request:        CreatePasteRequest{Content: "Test", Password: "123"},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Invalid expiry",
			request:        CreatePasteRequest{Content: "Test", Expiry: "invalid"},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body, _ := json.Marshal(tc.request)
			req := httptest.NewRequest("POST", "/api/paste", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			rr := httptest.NewRecorder()
			handler.Create(rr, req)

			if rr.Code != tc.expectedStatus {
				t.Errorf("Expected status %d, got %d", tc.expectedStatus, rr.Code)
			}
		})
	}
}

func TestGetPaste_Success(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	// Create a paste first
	paste := &models.Paste{
		ID:       "abc123",
		Content:  "Test content",
		Language: "text",
	}
	mockRepo.Create(paste)

	// Test retrieval
	req := httptest.NewRequest("GET", "/api/paste/abc123", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "abc123"})

	rr := httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	var response PasteResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Content != "Test content" {
		t.Errorf("Expected content 'Test content', got '%s'", response.Content)
	}

	if response.HasPassword {
		t.Error("Expected HasPassword to be false")
	}
}

func TestGetPaste_PasswordProtected(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	// Create a password-protected paste
	hashedPassword, _ := utils.HashPassword("secret123")
	paste := &models.Paste{
		ID:           "def456",
		Content:      "Secret content",
		Language:     "text",
		PasswordHash: &hashedPassword,
	}
	mockRepo.Create(paste)

	// Test retrieval without password (should fail)
	req := httptest.NewRequest("GET", "/api/paste/def456", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "def456"})

	rr := httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, rr.Code)
	}

	// Test retrieval with correct password
	req = httptest.NewRequest("GET", "/api/paste/def456?password=secret123", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "def456"})

	rr = httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	// Test retrieval with wrong password
	req = httptest.NewRequest("GET", "/api/paste/def456?password=wrongpass", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "def456"})

	rr = httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusForbidden {
		t.Errorf("Expected status %d, got %d", http.StatusForbidden, rr.Code)
	}
}

func TestGetPaste_NotFound(t *testing.T) {
	handler, _ := setupTestHandler()

	req := httptest.NewRequest("GET", "/api/paste/nonexistent", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "abc123"})

	rr := httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("Expected status %d, got %d", http.StatusNotFound, rr.Code)
	}
}

func TestGetPaste_InvalidID(t *testing.T) {
	handler, _ := setupTestHandler()

	req := httptest.NewRequest("GET", "/api/paste/invalid", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "invalid"})

	rr := httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, rr.Code)
	}
}

func TestGetPasteRaw_Success(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	// Create a paste first
	paste := &models.Paste{
		ID:       "ghi789",
		Content:  "Raw content test",
		Language: "text",
	}
	mockRepo.Create(paste)

	// Test raw retrieval
	req := httptest.NewRequest("GET", "/api/paste/ghi789/raw", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "ghi789"})

	rr := httptest.NewRecorder()
	handler.GetRaw(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	expectedContent := "Raw content test"
	if rr.Body.String() != expectedContent {
		t.Errorf("Expected content '%s', got '%s'", expectedContent, rr.Body.String())
	}

	contentType := rr.Header().Get("Content-Type")
	expectedContentType := "text/plain; charset=utf-8"
	if contentType != expectedContentType {
		t.Errorf("Expected Content-Type '%s', got '%s'", expectedContentType, contentType)
	}
}

func TestGetPaste_Expired(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	// Create an expired paste
	expiredTime := time.Now().Add(-1 * time.Hour)
	paste := &models.Paste{
		ID:        "jkl012",
		Content:   "Expired content",
		Language:  "text",
		ExpiresAt: &expiredTime,
	}
	mockRepo.Create(paste)

	// Test retrieval of expired paste
	req := httptest.NewRequest("GET", "/api/paste/jkl012", nil)
	req = mux.SetURLVars(req, map[string]string{"id": "jkl012"})

	rr := httptest.NewRecorder()
	handler.GetByID(rr, req)

	if rr.Code != http.StatusGone {
		t.Errorf("Expected status %d, got %d", http.StatusGone, rr.Code)
	}
}

func TestUnlockPaste_Success(t *testing.T) {
	handler, mockRepo := setupTestHandler()

	// Create a password-protected paste
	hashedPassword, _ := utils.HashPassword("secret123")
	paste := &models.Paste{
		ID:           "mno345",
		Content:      "Secret unlock content",
		Language:     "text",
		PasswordHash: &hashedPassword,
	}
	mockRepo.Create(paste)

	// Test unlock with correct password
	reqBody := map[string]string{"password": "secret123"}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest("POST", "/api/paste/mno345/unlock", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req = mux.SetURLVars(req, map[string]string{"id": "mno345"})

	rr := httptest.NewRecorder()
	handler.GetByIDWithPassword(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, rr.Code)
	}

	var response PasteResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Content != "Secret unlock content" {
		t.Errorf("Expected content 'Secret unlock content', got '%s'", response.Content)
	}
}
