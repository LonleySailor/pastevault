# PrivatePaste Backend

A self-hosted pastebin service backend written in Go with SQLite database.

## Phase 1 Implementation Status

✅ **Completed:**

### Project Structure

- ✅ Go module initialized with proper structure
- ✅ All required directories and files created
- ✅ Dependencies installed and configured

### Database Layer

- ✅ SQLite connection manager
- ✅ Database migrations system
- ✅ Paste and User models with repositories
- ✅ Foreign key constraints enabled

### HTTP Server Setup

- ✅ Gorilla Mux router configured
- ✅ CORS middleware setup
- ✅ All planned route structure in place:
  - `GET /api/health` - Health check (✅ working)
  - `POST /api/paste` - Create paste (🚧 skeleton)
  - `GET /api/paste/{id}` - Get paste (🚧 skeleton)
  - `POST /api/paste/{id}/unlock` - Password-protected paste (🚧 skeleton)
  - `POST /api/auth/register` - User registration (🚧 skeleton)
  - `POST /api/auth/login` - User login (🚧 skeleton)
  - `GET /api/auth/profile` - User profile (🚧 skeleton)
  - `DELETE /api/paste/{id}` - Delete paste (🚧 skeleton)

### ID Generation

- ✅ 6-character alphanumeric ID generator
- ✅ Collision detection and retry logic
- ✅ Comprehensive unit tests

### Security & Utilities

- ✅ bcrypt password hashing utilities
- ✅ Input validation framework
- ✅ Authentication middleware (placeholder)
- ✅ Comprehensive unit tests

### Configuration Management

- ✅ Environment-based configuration
- ✅ Development/production environment handling
- ✅ CORS origins configured per environment

### Middleware

- ✅ CORS middleware with environment-specific settings
- ✅ Request logging middleware
- ✅ Recovery middleware for panic handling
- ✅ Authentication middleware framework

## Quick Start

### Prerequisites

- Go 1.21 or higher
- SQLite3

### Installation

```bash
# Clone and navigate to backend
cd backend/

# Install dependencies
go mod tidy

# Build the application
go build -o privatepaste-server .

# Run the server
./privatepaste-server
```

### Development

```bash
# Run with hot reload during development
go run main.go

# Run tests
go test ./...

# Build for production
go build -o privatepaste-server .
```

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |
| `DATABASE_PATH` | `./privatepaste.db` | SQLite database file path |
| `JWT_SECRET` | `your-secret-key-change-in-production` | JWT signing secret |
| `ENVIRONMENT` | `development` | Environment (development/production) |

### Development Environment

- CORS allows localhost origins
- Debug logging enabled
- Default configurations

### Production Environment

- CORS restricted to `privatepaste.lunatria.com`
- Production-ready settings

## API Endpoints

### Health Check

```bash
GET /api/health
```

Returns server and database status.

### Paste Management (Skeleton)

```bash
POST /api/paste          # Create new paste
GET /api/paste/{id}      # Retrieve paste
POST /api/paste/{id}/unlock  # Unlock password-protected paste
DELETE /api/paste/{id}   # Delete paste (requires auth)
```

### Authentication (Skeleton)

```bash
POST /api/auth/register  # Register new user
POST /api/auth/login     # Login user
GET /api/auth/profile    # Get user profile (requires auth)
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Pastes Table

```sql
CREATE TABLE pastes (
    id TEXT PRIMARY KEY,           -- 6-character UUID
    content TEXT NOT NULL,         -- paste content
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,           -- nullable, for auto-expiry
    password_hash TEXT,            -- nullable, bcrypt hash
    user_id INTEGER,               -- nullable, foreign key to users
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
```

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./pkg/utils/
```

### Test Coverage

- ✅ ID generation and validation
- ✅ Password hashing and verification
- ✅ Basic validation utilities
- 🚧 Database operations (coming in Phase 2)
- 🚧 HTTP handlers (coming in Phase 2)

## Project Structure

```
backend/
├── main.go                    # Entry point
├── go.mod                     # Go modules
├── go.sum                     # Dependencies
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── database/
│   │   ├── sqlite.go         # Database connection
│   │   └── migrations.go     # Schema migrations
│   ├── models/
│   │   ├── paste.go          # Paste model & repository
│   │   └── user.go           # User model & repository
│   ├── handlers/
│   │   ├── paste.go          # Paste HTTP handlers
│   │   └── user.go           # User HTTP handlers
│   └── middleware/
│       ├── cors.go           # CORS middleware
│       └── auth.go           # Authentication middleware
└── pkg/
    ├── utils/
    │   ├── id_generator.go    # 6-char UUID generation
    │   ├── id_generator_test.go
    │   ├── hash.go           # Password hashing utilities
    │   └── hash_test.go
    └── validation/
        └── validator.go      # Input validation
```

## Next Phase

Phase 2 will implement:

- Actual paste creation and retrieval logic
- Password protection for pastes
- Expiry functionality
- User authentication with JWT
- Complete API functionality

## Success Criteria ✅

- [x] Go server starts without errors
- [x] SQLite database is created with proper schema
- [x] Health check endpoint responds correctly
- [x] Basic route structure is in place
- [x] All unit tests pass
- [x] Project follows Go best practices and conventions

All Phase 1 requirements have been successfully implemented!
