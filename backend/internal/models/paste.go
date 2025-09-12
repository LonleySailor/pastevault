package models

import (
	"database/sql"
	"time"
)

// Paste represents a paste in the system
type Paste struct {
	ID           string     `json:"id" db:"id"`
	Content      string     `json:"content" db:"content"`
	Language     string     `json:"language,omitempty" db:"language"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	ExpiresAt    *time.Time `json:"expires_at,omitempty" db:"expires_at"`
	PasswordHash *string    `json:"-" db:"password_hash"` // Never expose password hash in JSON
	UserID       *int       `json:"user_id,omitempty" db:"user_id"`
}

// PasteRepository handles database operations for pastes
type PasteRepository struct {
	db *sql.DB
}

// NewPasteRepository creates a new paste repository
func NewPasteRepository(db *sql.DB) *PasteRepository {
	return &PasteRepository{db: db}
}

// Create creates a new paste in the database
func (r *PasteRepository) Create(paste *Paste) error {
	query := `
		INSERT INTO pastes (id, content, language, expires_at, password_hash, user_id)
		VALUES (?, ?, ?, ?, ?, ?)
		RETURNING created_at`

	err := r.db.QueryRow(
		query,
		paste.ID,
		paste.Content,
		paste.Language,
		paste.ExpiresAt,
		paste.PasswordHash,
		paste.UserID,
	).Scan(&paste.CreatedAt)

	return err
}

// GetByID retrieves a paste by its ID
func (r *PasteRepository) GetByID(id string) (*Paste, error) {
	paste := &Paste{}
	query := `
		SELECT id, content, language, created_at, expires_at, password_hash, user_id 
		FROM pastes 
		WHERE id = ?`

	err := r.db.QueryRow(query, id).Scan(
		&paste.ID,
		&paste.Content,
		&paste.Language,
		&paste.CreatedAt,
		&paste.ExpiresAt,
		&paste.PasswordHash,
		&paste.UserID,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return paste, nil
}

// GetByUserID retrieves all pastes by a user ID
func (r *PasteRepository) GetByUserID(userID int, limit, offset int) ([]*Paste, error) {
	query := `
		SELECT id, content, language, created_at, expires_at, password_hash, user_id 
		FROM pastes 
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?`

	rows, err := r.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pastes []*Paste
	for rows.Next() {
		paste := &Paste{}
		err := rows.Scan(
			&paste.ID,
			&paste.Content,
			&paste.Language,
			&paste.CreatedAt,
			&paste.ExpiresAt,
			&paste.PasswordHash,
			&paste.UserID,
		)
		if err != nil {
			return nil, err
		}
		pastes = append(pastes, paste)
	}

	return pastes, rows.Err()
}

// Update updates a paste's content (only if not expired)
func (r *PasteRepository) Update(paste *Paste) error {
	query := `
		UPDATE pastes 
		SET content = ?, language = ?, expires_at = ?, password_hash = ?
		WHERE id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))`

	result, err := r.db.Exec(
		query,
		paste.Content,
		paste.Language,
		paste.ExpiresAt,
		paste.PasswordHash,
		paste.ID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows // Paste not found or expired
	}

	return nil
}

// Delete deletes a paste by its ID
func (r *PasteRepository) Delete(id string) error {
	query := `DELETE FROM pastes WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}

// DeleteExpired deletes all expired pastes
func (r *PasteRepository) DeleteExpired() (int64, error) {
	query := `DELETE FROM pastes WHERE expires_at IS NOT NULL AND expires_at <= datetime('now')`
	result, err := r.db.Exec(query)
	if err != nil {
		return 0, err
	}

	return result.RowsAffected()
}

// Exists checks if a paste ID already exists
func (r *PasteRepository) Exists(id string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM pastes WHERE id = ?`
	err := r.db.QueryRow(query, id).Scan(&count)
	return count > 0, err
}

// IsExpired checks if a paste has expired
func (p *Paste) IsExpired() bool {
	if p.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*p.ExpiresAt)
}

// HasPassword checks if a paste is password protected
func (p *Paste) HasPassword() bool {
	return p.PasswordHash != nil && *p.PasswordHash != ""
}
