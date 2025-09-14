package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/LonleySailor/pastevault/backend/internal/auth"
	"github.com/LonleySailor/pastevault/backend/internal/config"
	"github.com/LonleySailor/pastevault/backend/internal/database"
	"github.com/LonleySailor/pastevault/backend/internal/handlers"
	"github.com/LonleySailor/pastevault/backend/internal/middleware"
	"github.com/LonleySailor/pastevault/backend/internal/models"
	"github.com/LonleySailor/pastevault/backend/internal/services"
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

	// Initialize utilities & services
	idGenerator := utils.NewIDGenerator()
	validator := validation.NewValidator()
	tokenManager := auth.NewTokenManager(cfg.JWTSecret, cfg.RefreshJWTSecret)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(tokenManager)
	corsMiddleware := middleware.SetupCORS(cfg.CORSOrigins, cfg.IsDevelopment())
	rateLimiter := middleware.NewDefaultRateLimiter() // Will be enhanced later

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userRepo, tokenManager, validator)
	pasteHandler := handlers.NewPasteHandler(pasteRepo, idGenerator, validator)
	healthHandler := handlers.NewHealthHandler(db.DB)

	// Initialize services
	cleanupService := services.NewCleanupService(pasteRepo)
	cleanupService.Start()
	defer cleanupService.Stop()

	// Setup router
	router := mux.NewRouter()

	// Apply global middleware
	router.Use(middleware.SecurityHeaders)   // Add security headers
	router.Use(middleware.LoggingMiddleware) // Use a proper structured logger
	router.Use(middleware.RecoveryMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Health check endpoints
	api.HandleFunc("/health", healthHandler.BasicHealth).Methods("GET")
	api.HandleFunc("/health/detailed", healthHandler.DetailedHealth).Methods("GET")

	// Public paste routes
	pasteRouter := api.PathPrefix("/paste").Subrouter()
	pasteRouter.Handle("", rateLimiter.LimitPasteCreation(http.HandlerFunc(pasteHandler.Create))).Methods("POST")
	pasteRouter.Handle("/{id}", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetByID))).Methods("GET")
	pasteRouter.Handle("/{id}/raw", rateLimiter.LimitPasteRetrieval(http.HandlerFunc(pasteHandler.GetRaw))).Methods("GET")
	pasteRouter.HandleFunc("/{id}/unlock", pasteHandler.GetByIDWithPassword).Methods("POST")

	// Auth routes with rate limiting
	authRouter := api.PathPrefix("/auth").Subrouter()
	authRouter.Handle("/register", rateLimiter.LimitRegistration(http.HandlerFunc(userHandler.Register))).Methods("POST")
	authRouter.Handle("/login", rateLimiter.LimitAuthentication(http.HandlerFunc(userHandler.Login))).Methods("POST")
	authRouter.HandleFunc("/refresh", userHandler.RefreshToken).Methods("POST")
	authRouter.HandleFunc("/logout", userHandler.Logout).Methods("POST") // Placeholder

	// Protected routes (require authentication)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(authMiddleware.RequireAuth)

	// Protected user routes
	protected.HandleFunc("/user/profile", userHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/user/pastes", pasteHandler.GetUserPastes).Methods("GET")

	// Protected paste routes
	protected.HandleFunc("/paste/{id}", pasteHandler.Delete).Methods("DELETE")
	// protected.HandleFunc("/paste/{id}", pasteHandler.Update).Methods("PATCH") // TODO

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
