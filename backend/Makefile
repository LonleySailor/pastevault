# PasteVault Backend Makefile
# This is a simplified version that works with the root Makefile

.PHONY: build run dev test clean deps health install-tools hot db-reset

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
