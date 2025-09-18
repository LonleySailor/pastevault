# Multi-stage Dockerfile for PrivatePaste mono-repo
# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Go backend
FROM golang:alpine AS backend-builder

# Install build dependencies for CGO
RUN apk add --no-cache gcc musl-dev sqlite-dev

WORKDIR /app/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o privatepaste-server .

# Stage 3: Final runtime image
FROM alpine:latest

# Install sqlite3 and ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates sqlite

WORKDIR /app

# Copy the backend binary
COPY --from=backend-builder /app/backend/privatepaste-server .

# Copy the frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Create a non-root user
RUN addgroup -g 1001 -S privatepaste && \
    adduser -S privatepaste -u 1001 -G privatepaste

# Change ownership of the app directory
RUN chown -R privatepaste:privatepaste /app

# Switch to non-root user
USER privatepaste

# Set environment variables
ENV PORT=8080
ENV DATABASE_PATH=/app/data/privatepaste.db
ENV ENVIRONMENT=production
ENV JWT_SECRET=change-this-in-production
ENV REFRESH_JWT_SECRET=change-this-refresh-secret-in-production

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Run the application
CMD ["./privatepaste-server"]
