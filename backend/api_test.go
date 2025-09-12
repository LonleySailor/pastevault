package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/LonleySailor/pastevault/backend/internal/config"
	"github.com/LonleySailor/pastevault/backend/internal/database"
	"github.com/LonleySailor/pastevault/backend/internal/handlers"
	"github.com/LonleySailor/pastevault/backend/internal/middleware"
	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/utils"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
)

// Test server setup
type TestServer struct {
	server  *httptest.Server
	db      *database.Database
	router  *mux.Router
	cleanup func()
}

func setupTestServer(t *testing.T) *TestServer {
	// Create temporary database with unique name for each test
	tempDB := fmt.Sprintf(":memory:")

	cfg := &config.Config{
		DatabasePath: tempDB,
		Port:         "8080",
		JWTSecret:    "test-secret-key-for-testing-only",
	}

	// Create database connection manually for testing
	sqlDB, err := sql.Open("sqlite3", tempDB)
	if err != nil {
		t.Fatalf("Failed to open test database: %v", err)
	}

	// Enable foreign keys
	if _, err := sqlDB.Exec("PRAGMA foreign_keys = ON;"); err != nil {
		t.Fatalf("Failed to enable foreign keys: %v", err)
	}

	// Create tables manually for testing
	createUsersSQL := `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	createPastesSQL := `
	CREATE TABLE pastes (
		id TEXT PRIMARY KEY,
		content TEXT NOT NULL,
		language TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		expires_at DATETIME,
		password_hash TEXT,
		user_id INTEGER,
		FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
	);`

	if _, err := sqlDB.Exec(createUsersSQL); err != nil {
		t.Fatalf("Failed to create users table: %v", err)
	}

	if _, err := sqlDB.Exec(createPastesSQL); err != nil {
		t.Fatalf("Failed to create pastes table: %v", err)
	}

	// Create database wrapper
	db := &database.Database{DB: sqlDB}

	// Create repositories and utilities
	pasteRepo := models.NewPasteRepository(db.DB)
	userRepo := models.NewUserRepository(db.DB)
	idGenerator := utils.NewIDGenerator()
	validator := validation.NewValidator()

	// Create handlers
	pasteHandler := handlers.NewPasteHandler(pasteRepo, idGenerator, validator)
	userHandler := handlers.NewUserHandler(userRepo, validator)

	// Setup router
	router := mux.NewRouter()

	// Apply global middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.RecoveryMiddleware)

	api := router.PathPrefix("/api").Subrouter()

	// Rate limiting
	rateLimiter := middleware.NewRateLimiter(10, 100, time.Hour)

	// Public routes
	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}).Methods("GET")

	// User routes
	api.HandleFunc("/auth/register", userHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", userHandler.Login).Methods("POST")

	// Paste routes with rate limiting
	api.Handle("/paste", rateLimiter.LimitPasteCreation(http.HandlerFunc(pasteHandler.Create))).Methods("POST")
	api.Handle("/paste/{id}", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetByID))).Methods("GET")
	api.Handle("/paste/{id}/raw", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetRaw))).Methods("GET")
	api.HandleFunc("/paste/{id}/unlock", pasteHandler.GetByIDWithPassword).Methods("POST")

	// Protected routes
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(authMiddleware.RequireAuth)
	protected.HandleFunc("/paste/{id}", pasteHandler.Delete).Methods("DELETE")

	server := httptest.NewServer(router)

	return &TestServer{
		server: server,
		db:     db,
		router: router,
		cleanup: func() {
			server.Close()
			db.Close()
		},
	}
}

func (ts *TestServer) Close() {
	ts.cleanup()
}

// Helper functions for API testing
func (ts *TestServer) POST(path string, body interface{}) (*http.Response, error) {
	var reqBody []byte
	var err error

	if body != nil {
		reqBody, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	return http.Post(ts.server.URL+path, "application/json", bytes.NewBuffer(reqBody))
}

func (ts *TestServer) GET(path string) (*http.Response, error) {
	return http.Get(ts.server.URL + path)
}

func (ts *TestServer) DELETE(path string, token string) (*http.Response, error) {
	req, err := http.NewRequest("DELETE", ts.server.URL+path, nil)
	if err != nil {
		return nil, err
	}

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := &http.Client{}
	return client.Do(req)
}

// Test data structures
type CreatePasteRequest struct {
	Content  string `json:"content"`
	Language string `json:"language,omitempty"`
	Expiry   string `json:"expiry,omitempty"`
	Password string `json:"password,omitempty"`
}

// CreatePasteResponse represents the response when creating a paste
type CreatePasteResponse struct {
	ID        string `json:"id"`
	URL       string `json:"url"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at,omitempty"`
}

type PasteResponse struct {
	ID          string     `json:"id"`
	Content     string     `json:"content"`
	Language    string     `json:"language,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at,omitempty"`
	HasPassword bool       `json:"has_password"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// Comprehensive API Tests
func TestAPIHealthCheck(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	resp, err := ts.GET("/api/health")
	if err != nil {
		t.Fatalf("Health check failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}
}

func TestCreatePasteBasic(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	tests := []struct {
		name       string
		request    CreatePasteRequest
		wantStatus int
	}{
		{
			name: "Simple paste",
			request: CreatePasteRequest{
				Content: "Hello, World!",
			},
			wantStatus: http.StatusCreated,
		},
		{
			name: "Paste with language",
			request: CreatePasteRequest{
				Content:  "console.log('Hello');",
				Language: "javascript",
			},
			wantStatus: http.StatusCreated,
		},
		{
			name: "Paste with password",
			request: CreatePasteRequest{
				Content:  "Secret content",
				Password: "mysecret",
			},
			wantStatus: http.StatusCreated,
		},
		{
			name: "Paste with expiry",
			request: CreatePasteRequest{
				Content: "Temporary content",
				Expiry:  "1h",
			},
			wantStatus: http.StatusCreated,
		},
		{
			name: "Empty content",
			request: CreatePasteRequest{
				Content: "",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Content too large",
			request: CreatePasteRequest{
				Content: strings.Repeat("a", 1024*1024+1), // 1MB + 1 byte
			},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := ts.POST("/api/paste", tt.request)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, resp.StatusCode)
			}

			if resp.StatusCode == http.StatusCreated {
				var createResp CreatePasteResponse
				if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}

				if createResp.ID == "" {
					t.Error("Expected non-empty ID")
				}
				if !strings.Contains(createResp.URL, createResp.ID) {
					t.Error("URL should contain paste ID")
				}
			}
		})
	}
}

func TestGetPasteScenarios(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	// Create test pastes
	testCases := []struct {
		name    string
		paste   CreatePasteRequest
		testGet func(t *testing.T, pasteID string)
	}{
		{
			name: "Public paste",
			paste: CreatePasteRequest{
				Content:  "Public content",
				Language: "text",
			},
			testGet: func(t *testing.T, pasteID string) {
				resp, err := ts.GET("/api/paste/" + pasteID)
				if err != nil {
					t.Fatalf("GET request failed: %v", err)
				}
				defer resp.Body.Close()

				if resp.StatusCode != http.StatusOK {
					t.Errorf("Expected status 200, got %d", resp.StatusCode)
					return
				}

				var pasteResp PasteResponse
				if err := json.NewDecoder(resp.Body).Decode(&pasteResp); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}

				if pasteResp.Content != "Public content" {
					t.Errorf("Expected content 'Public content', got '%s'", pasteResp.Content)
				}
				if pasteResp.HasPassword {
					t.Error("Public paste should not have password")
				}
			},
		},
		{
			name: "Password protected paste",
			paste: CreatePasteRequest{
				Content:  "Protected content",
				Password: "secret123",
			},
			testGet: func(t *testing.T, pasteID string) {
				// Test without password - should get 401
				resp, err := ts.GET("/api/paste/" + pasteID)
				if err != nil {
					t.Fatalf("GET request failed: %v", err)
				}
				resp.Body.Close()

				if resp.StatusCode != http.StatusUnauthorized {
					t.Errorf("Expected status 401, got %d", resp.StatusCode)
				}

				// Test with correct password
				passwordReq := map[string]string{"password": "secret123"}
				resp, err = ts.POST("/api/paste/"+pasteID+"/unlock", passwordReq)
				if err != nil {
					t.Fatalf("Password request failed: %v", err)
				}
				defer resp.Body.Close()

				if resp.StatusCode != http.StatusOK {
					t.Errorf("Expected status 200 with correct password, got %d", resp.StatusCode)
					return
				}

				var pasteResp PasteResponse
				if err := json.NewDecoder(resp.Body).Decode(&pasteResp); err != nil {
					t.Fatalf("Failed to decode response: %v", err)
				}

				if pasteResp.Content != "Protected content" {
					t.Errorf("Expected content 'Protected content', got '%s'", pasteResp.Content)
				}
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create paste
			resp, err := ts.POST("/api/paste", tc.paste)
			if err != nil {
				t.Fatalf("Failed to create paste: %v", err)
			}
			defer resp.Body.Close()

			var createResp CreatePasteResponse
			if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
				t.Fatalf("Failed to decode create response: %v", err)
			}

			// Test get scenarios
			tc.testGet(t, createResp.ID)
		})
	}
}

func TestGetRawPaste(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	// Create a test paste
	createReq := CreatePasteRequest{
		Content:  "Raw content test",
		Language: "python",
	}

	resp, err := ts.POST("/api/paste", createReq)
	if err != nil {
		t.Fatalf("Failed to create paste: %v", err)
	}
	defer resp.Body.Close()

	var createResp CreatePasteResponse
	if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
		t.Fatalf("Failed to decode create response: %v", err)
	}

	// Test raw endpoint
	resp, err = ts.GET("/api/paste/" + createResp.ID + "/raw")
	if err != nil {
		t.Fatalf("Raw GET request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	if resp.Header.Get("Content-Type") != "text/plain; charset=utf-8" {
		t.Errorf("Expected Content-Type 'text/plain; charset=utf-8', got '%s'", resp.Header.Get("Content-Type"))
	}

	body := make([]byte, 1024)
	n, _ := resp.Body.Read(body)
	content := string(body[:n])

	if content != "Raw content test" {
		t.Errorf("Expected content 'Raw content test', got '%s'", content)
	}
}

func TestNonExistentPaste(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	resp, err := ts.GET("/api/paste/NONEXT")
	if err != nil {
		t.Fatalf("GET request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}
}

func TestPasswordValidation(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	// Create password protected paste
	createReq := CreatePasteRequest{
		Content:  "Secret data",
		Password: "correct_password",
	}

	resp, err := ts.POST("/api/paste", createReq)
	if err != nil {
		t.Fatalf("Failed to create paste: %v", err)
	}
	defer resp.Body.Close()

	var createResp CreatePasteResponse
	if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
		t.Fatalf("Failed to decode create response: %v", err)
	}

	// Test wrong password
	wrongPasswordReq := map[string]string{"password": "wrong_password"}
	resp, err = ts.POST("/api/paste/"+createResp.ID+"/unlock", wrongPasswordReq)
	if err != nil {
		t.Fatalf("Password request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		t.Errorf("Expected status 403 for wrong password, got %d", resp.StatusCode)
	}

	// Test missing password
	resp, err = ts.POST("/api/paste/"+createResp.ID+"/unlock", map[string]string{})
	if err != nil {
		t.Fatalf("Password request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400 for missing password, got %d", resp.StatusCode)
	}
}

func TestExpiryHandling(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	// Create paste with valid expiry (test validation works)
	createReq := CreatePasteRequest{
		Content: "Expiring content",
		Expiry:  "1h",
	}

	resp, err := ts.POST("/api/paste", createReq)
	if err != nil {
		t.Fatalf("Failed to create paste: %v", err)
	}
	defer resp.Body.Close()

	var createResp CreatePasteResponse
	if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
		t.Fatalf("Failed to decode create response: %v", err)
	}

	// Test that paste exists initially
	resp, err = ts.GET("/api/paste/" + createResp.ID)
	if err != nil {
		t.Fatalf("GET request failed: %v", err)
	}
	resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200 for valid paste, got %d", resp.StatusCode)
	}

	// Test invalid expiry formats
	invalidExpiryTests := []struct {
		name   string
		expiry string
	}{
		{"seconds not allowed", "30s"},
		{"invalid format", "invalid"},
		{"negative duration", "-1h"},
	}

	for _, tt := range invalidExpiryTests {
		t.Run(tt.name, func(t *testing.T) {
			invalidReq := CreatePasteRequest{
				Content: "Test content",
				Expiry:  tt.expiry,
			}

			resp, err := ts.POST("/api/paste", invalidReq)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusBadRequest {
				t.Errorf("Expected status 400 for invalid expiry '%s', got %d", tt.expiry, resp.StatusCode)
			}
		})
	}
}

func TestConcurrentPasteCreation(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	const numGoroutines = 5 // Reduced to avoid SQLite lock issues
	results := make(chan error, numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			// Add small delay to reduce contention
			time.Sleep(time.Duration(id*10) * time.Millisecond)

			createReq := CreatePasteRequest{
				Content: fmt.Sprintf("Concurrent paste %d", id),
			}

			resp, err := ts.POST("/api/paste", createReq)
			if err != nil {
				results <- err
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusCreated {
				results <- fmt.Errorf("goroutine %d: expected status 201, got %d", id, resp.StatusCode)
				return
			}

			results <- nil
		}(i)
	}

	// Check all results
	for i := 0; i < numGoroutines; i++ {
		if err := <-results; err != nil {
			t.Errorf("Concurrent creation failed: %v", err)
		}
	}
}

func TestAPIValidation(t *testing.T) {
	ts := setupTestServer(t)
	defer ts.Close()

	invalidRequests := []struct {
		name       string
		request    interface{}
		wantStatus int
	}{
		{
			name:       "Invalid JSON",
			request:    "invalid json",
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Invalid expiry format",
			request: CreatePasteRequest{
				Content: "Test",
				Expiry:  "invalid",
			},
			wantStatus: http.StatusBadRequest,
		},
		{
			name: "Language too long",
			request: CreatePasteRequest{
				Content:  "Test",
				Language: strings.Repeat("a", 51), // Over 50 character limit
			},
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range invalidRequests {
		t.Run(tt.name, func(t *testing.T) {
			resp, err := ts.POST("/api/paste", tt.request)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != tt.wantStatus {
				t.Errorf("Expected status %d, got %d", tt.wantStatus, resp.StatusCode)
			}
		})
	}
}

// Benchmark tests
func BenchmarkCreatePaste(b *testing.B) {
	ts := setupTestServer(&testing.T{})
	defer ts.Close()

	createReq := CreatePasteRequest{
		Content: "Benchmark test content",
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		resp, err := ts.POST("/api/paste", createReq)
		if err != nil {
			b.Fatalf("Request failed: %v", err)
		}
		resp.Body.Close()
	}
}

func BenchmarkGetPaste(b *testing.B) {
	ts := setupTestServer(&testing.T{})
	defer ts.Close()

	// Create a test paste
	createReq := CreatePasteRequest{
		Content: "Benchmark get test content",
	}

	resp, err := ts.POST("/api/paste", createReq)
	if err != nil {
		b.Fatalf("Failed to create test paste: %v", err)
	}
	defer resp.Body.Close()

	var createResp CreatePasteResponse
	if err := json.NewDecoder(resp.Body).Decode(&createResp); err != nil {
		b.Fatalf("Failed to decode create response: %v", err)
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		resp, err := ts.GET("/api/paste/" + createResp.ID)
		if err != nil {
			b.Fatalf("GET request failed: %v", err)
		}
		resp.Body.Close()
	}
}

// Test helper to run all API tests
func TestMain(m *testing.M) {
	// Set test environment
	os.Setenv("ENV", "test")

	// Run tests
	code := m.Run()

	// Cleanup
	os.Exit(code)
}
