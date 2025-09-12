package middleware

import (
	"net/http"

	"github.com/rs/cors"
)

// SetupCORS creates and configures CORS middleware
func SetupCORS(allowedOrigins []string, isDevelopment bool) *cors.Cors {
	options := cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodDelete,
			http.MethodOptions,
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		ExposedHeaders: []string{
			"Link",
		},
		AllowCredentials: true,
		MaxAge:           300, // 5 minutes
	}

	// In development, be more permissive
	if isDevelopment {
		options.AllowedOrigins = append(options.AllowedOrigins, "http://localhost:*")
		options.Debug = true
	}

	return cors.New(options)
}

// CORSHandler wraps a handler with CORS middleware
func CORSHandler(next http.Handler, corsMiddleware *cors.Cors) http.Handler {
	return corsMiddleware.Handler(next)
}
