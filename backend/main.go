package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/LonleySailor/pastevault/backend/internal/config"
	"github.com/LonleySailor/pastevault/backend/internal/database"
	"github.com/LonleySailor/pastevault/backend/internal/handlers"
	"github.com/LonleySailor/pastevault/backend/internal/middleware"
	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/pkg/utils"
	"github.com/LonleySailor/pastevault/backend/pkg/validation"
	"github.com/gorilla/mux"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Printf("Starting PasteVault API server...")
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Port: %s", cfg.Port)
	log.Printf("Database: %s", cfg.DatabasePath)

	// Initialize database
	db, err := database.NewSQLiteDB(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := models.NewUserRepository(db.DB)
	pasteRepo := models.NewPasteRepository(db.DB)

	// Initialize utilities
	idGenerator := utils.NewIDGenerator()
	validator := validation.NewValidator()

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(cfg.JWTSecret)
	corsMiddleware := middleware.SetupCORS(cfg.CORSOrigins, cfg.IsDevelopment())
	rateLimiter := middleware.NewDefaultRateLimiter()

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userRepo, validator)
	pasteHandler := handlers.NewPasteHandler(pasteRepo, idGenerator, validator)

	// Setup router
	router := mux.NewRouter()

	// Apply global middleware
	router.Use(middleware.LoggingMiddleware)
	router.Use(middleware.RecoveryMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Health check endpoint
	api.HandleFunc("/health", healthCheckHandler(db)).Methods("GET")

	// Paste routes
	api.Handle("/paste", rateLimiter.LimitPasteCreation(http.HandlerFunc(pasteHandler.Create))).Methods("POST")
	api.Handle("/paste/{id}", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetByID))).Methods("GET")
	api.Handle("/paste/{id}/raw", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetRaw))).Methods("GET")
	api.HandleFunc("/paste/{id}/unlock", pasteHandler.GetByIDWithPassword).Methods("POST")

	// User authentication routes
	api.HandleFunc("/auth/register", userHandler.Register).Methods("POST")
	api.HandleFunc("/auth/login", userHandler.Login).Methods("POST")

	// Protected routes (require authentication)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(authMiddleware.RequireAuth)
	protected.HandleFunc("/auth/profile", userHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/paste/{id}", pasteHandler.Delete).Methods("DELETE")

	// Wrap router with CORS
	handler := middleware.CORSHandler(router, corsMiddleware)

	// Start server
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handler,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		if err := server.Close(); err != nil {
			log.Printf("Error shutting down server: %v", err)
		}
	}()

	log.Printf("Server starting on port %s", cfg.Port)
	log.Printf("Health check available at: http://localhost:%s/api/health", cfg.Port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed to start: %v", err)
	}

	log.Println("Server stopped")
}

// healthCheckHandler provides a health check endpoint
func healthCheckHandler(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check database health
		if err := db.Health(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","database":"error","error":"%s"}`, err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"healthy","database":"connected","version":"1.0.0"}`)
	}
}
