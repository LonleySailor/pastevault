# PasteVault Backend Makefile

.PHONY: help build run test clean dev deps

# Default target
help:
	@echo "Available targets:"
	@echo "  build    - Build the application"
	@echo "  run      - Run the application"
	@echo "  dev      - Run in development mode with hot reload"
	@echo "  test     - Run all tests"
	@echo "  clean    - Clean build artifacts"
	@echo "  deps     - Download and tidy dependencies"
	@echo "  health   - Test health endpoint (server must be running)"

# Build the application
build:
	@echo "Building PasteVault server..."
	go build -o pastevault-server .

# Run the built application
run: build
	@echo "Starting PasteVault server..."
	./pastevault-server

# Run in development mode
dev:
	@echo "Starting development server..."
	go run main.go

# Run tests
test:
	@echo "Running tests..."
	go test ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -cover ./...

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -f pastevault-server
	rm -f pastevault.db

# Download and tidy dependencies
deps:
	@echo "Downloading and tidying dependencies..."
	go mod download
	go mod tidy

# Test health endpoint (requires server to be running)
health:
	@echo "Testing health endpoint..."
	curl -s http://localhost:8080/api/health | jq . || curl -s http://localhost:8080/api/health

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/cosmtrek/air@latest

# Run with hot reload (requires air)
hot:
	@echo "Starting with hot reload..."
	air

# Database reset (removes database file)
db-reset:
	@echo "Resetting database..."
	rm -f pastevault.db
	@echo "Database will be recreated on next server start"

# Show project structure
tree:
	@echo "Project structure:"
	tree -I 'pastevault-server|pastevault.db|*.log'
