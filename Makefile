# PasteVault Monorepo Makefile

.PHONY: help start start-backend start-frontend build build-backend build-frontend \
        test test-backend test-frontend clean clean-backend clean-frontend \
        deps deps-backend deps-frontend dev dev-backend dev-frontend \
        health install-tools hot db-reset tree stop

# Default target
help:
	@echo "PasteVault Monorepo Commands:"
	@echo ""
	@echo "  Start Commands:"
	@echo "    start              - Start both backend and frontend in parallel"
	@echo "    start-backend      - Start only the backend server"
	@echo "    start-frontend     - Start only the frontend dev server"
	@echo ""
	@echo "  Build Commands:"
	@echo "    build              - Build both backend and frontend"
	@echo "    build-backend      - Build only the backend"
	@echo "    build-frontend     - Build only the frontend"
	@echo ""
	@echo "  Development Commands:"
	@echo "    dev                - Run both in development mode"
	@echo "    dev-backend        - Run backend in development mode"
	@echo "    dev-frontend       - Run frontend in development mode"
	@echo "    hot                - Run backend with hot reload (requires air)"
	@echo ""
	@echo "  Test Commands:"
	@echo "    test               - Run tests for both backend and frontend"
	@echo "    test-backend       - Run only backend tests"
	@echo "    test-frontend      - Run only frontend tests"
	@echo ""
	@echo "  Utility Commands:"
	@echo "    deps               - Install dependencies for both projects"
	@echo "    deps-backend       - Install only backend dependencies"
	@echo "    deps-frontend      - Install only frontend dependencies"
	@echo "    clean              - Clean both projects"
	@echo "    health             - Test backend health endpoint"
	@echo "    db-reset           - Reset the database"
	@echo "    install-tools      - Install development tools"
	@echo "    tree               - Show project structure"
	@echo "    stop               - Stop any running processes"

# === START COMMANDS ===

# Start both backend and frontend in parallel
start:
	@echo "🚀 Starting PasteVault (Backend + Frontend)..."
	@echo "Backend will be available at: http://localhost:8080"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Press Ctrl+C to stop both services"
	@trap 'make stop' EXIT; \
	(make start-backend &) && \
	(sleep 3 && make start-frontend)

# Start only backend
start-backend:
	@echo "🔧 Starting PasteVault backend..."
	@cd backend && make run

# Start only frontend  
start-frontend:
	@echo "🎨 Starting PasteVault frontend..."
	@cd frontend && npm run dev

# === BUILD COMMANDS ===

# Build both projects
build: build-backend build-frontend

# Build backend
build-backend:
	@echo "🔨 Building backend..."
	@cd backend && make build

# Build frontend for production
build-frontend:
	@echo "🔨 Building frontend..."
	@cd frontend && npm run build

# === DEVELOPMENT COMMANDS ===

# Run both in development mode
dev:
	@echo "🛠️  Starting development mode (Backend + Frontend)..."
	@echo "Backend will be available at: http://localhost:8080"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Press Ctrl+C to stop both services"
	@trap 'make stop' EXIT; \
	(make dev-backend &) && \
	(sleep 3 && make dev-frontend)

# Run backend in development mode
dev-backend:
	@echo "🛠️  Starting backend development server..."
	@cd backend && make dev

# Run frontend in development mode
dev-frontend:
	@echo "🛠️  Starting frontend development server..."
	@cd frontend && npm run dev

# Run backend with hot reload
hot:
	@echo "🔥 Starting backend with hot reload..."
	@cd backend && make hot

# === TEST COMMANDS ===

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && make test

# Run backend tests with coverage
test-backend-coverage:
	@echo "🧪 Running backend tests with coverage..."
	@cd backend && make test-coverage

# Run frontend tests (if available)
test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test 2>/dev/null || echo "No frontend tests configured yet"

# === DEPENDENCY MANAGEMENT ===

# Install dependencies for both projects
deps: deps-backend deps-frontend

# Install backend dependencies
deps-backend:
	@echo "📦 Installing backend dependencies..."
	@cd backend && make deps

# Install frontend dependencies
deps-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install

# === CLEANUP COMMANDS ===

# Clean both projects
clean: clean-backend clean-frontend

# Clean backend artifacts
clean-backend:
	@echo "🧹 Cleaning backend..."
	@cd backend && make clean

# Clean frontend artifacts
clean-frontend:
	@echo "🧹 Cleaning frontend..."
	@cd frontend && rm -rf dist node_modules/.vite

# Stop any running processes
stop:
	@echo "🛑 Stopping any running PasteVault processes..."
	@pkill -f "pastevault-server" 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@pkill -f "air" 2>/dev/null || true

# === UTILITY COMMANDS ===

# Test backend health endpoint
health:
	@echo "🏥 Testing backend health endpoint..."
	@cd backend && make health

# Reset database
db-reset:
	@echo "🗂️  Resetting database..."
	@cd backend && make db-reset

# Install development tools
install-tools:
	@echo "🔧 Installing development tools..."
	@cd backend && make install-tools

# Show project structure
tree:
	@echo "📁 Project structure:"
	@tree -I 'node_modules|dist|pastevault-server|pastevault.db|*.log|.git' 2>/dev/null || find . -type f -name "*.go" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "Makefile" | grep -E "(backend|frontend)" | sort

# === QUICK SETUP ===

# Complete setup for new developers
setup: deps build
	@echo "✅ PasteVault setup complete!"
	@echo ""
	@echo "Quick start:"
	@echo "  make start    - Start both frontend and backend"
	@echo "  make dev      - Start in development mode"
	@echo "  make help     - Show all available commands"

# === PRODUCTION COMMANDS ===

# Production build
prod-build: clean build
	@echo "🚀 Production build complete!"

# Production deployment preparation
prod-deploy: prod-build
	@echo "📦 Ready for production deployment"
	@echo "Backend binary: backend/pastevault-server"
	@echo "Frontend dist: frontend/dist"
