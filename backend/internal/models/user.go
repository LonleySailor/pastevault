package models

import (
	"database/sql"
	"time"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	PasswordHash string    `json:"-" db:"password_hash"` // Never expose password hash in JSON
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// UserRepository handles database operations for users
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user in the database
func (r *UserRepository) Create(user *User) error {
	query := `
		INSERT INTO users (username, password_hash)
		VALUES (?, ?)
		RETURNING id, created_at`

	err := r.db.QueryRow(query, user.Username, user.PasswordHash).Scan(&user.ID, &user.CreatedAt)
	return err
}

// GetByID retrieves a user by their ID
func (r *UserRepository) GetByID(id int) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password_hash, created_at FROM users WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetByUsername retrieves a user by their username
func (r *UserRepository) GetByUsername(username string) (*User, error) {
	user := &User{}
	query := `SELECT id, username, password_hash, created_at FROM users WHERE username = ?`

	err := r.db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		&user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return user, nil
}

// Update updates a user's information
func (r *UserRepository) Update(user *User) error {
	query := `
		UPDATE users 
		SET username = ?, password_hash = ?
		WHERE id = ?`

	_, err := r.db.Exec(query, user.Username, user.PasswordHash, user.ID)
	return err
}

// Delete deletes a user by their ID
func (r *UserRepository) Delete(id int) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// Exists checks if a username already exists
func (r *UserRepository) Exists(username string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE username = ?`
	err := r.db.QueryRow(query, username).Scan(&count)
	return count > 0, err
}
