package database

import (
	"fmt"
	"log"
)

// runMigrations executes all database migrations
func (d *Database) runMigrations() error {
	log.Println("Running database migrations...")

	// Create migrations table to track applied migrations
	if err := d.createMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Define all migrations
	migrations := []Migration{
		{
			ID:          1,
			Description: "Create users table",
			SQL:         createUsersTableSQL,
		},
		{
			ID:          2,
			Description: "Create pastes table",
			SQL:         createPastesTableSQL,
		},
		{
			ID:          3,
			Description: "Add language column to pastes table",
			SQL:         addLanguageColumnSQL,
		},
	}

	// Execute migrations
	for _, migration := range migrations {
		if err := d.executeMigration(migration); err != nil {
			return fmt.Errorf("failed to execute migration %d: %w", migration.ID, err)
		}
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// Migration represents a database migration
type Migration struct {
	ID          int
	Description string
	SQL         string
}

// createMigrationsTable creates the migrations tracking table
func (d *Database) createMigrationsTable() error {
	query := `
	CREATE TABLE IF NOT EXISTS migrations (
		id INTEGER PRIMARY KEY,
		description TEXT NOT NULL,
		applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := d.DB.Exec(query)
	return err
}

// executeMigration executes a single migration if it hasn't been applied yet
func (d *Database) executeMigration(migration Migration) error {
	// Check if migration has already been applied
	var count int
	err := d.DB.QueryRow("SELECT COUNT(*) FROM migrations WHERE id = ?", migration.ID).Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Printf("Migration %d already applied, skipping", migration.ID)
		return nil
	}

	// Execute the migration
	log.Printf("Applying migration %d: %s", migration.ID, migration.Description)
	_, err = d.DB.Exec(migration.SQL)
	if err != nil {
		return err
	}

	// Record the migration as applied
	_, err = d.DB.Exec(
		"INSERT INTO migrations (id, description) VALUES (?, ?)",
		migration.ID,
		migration.Description,
	)
	return err
}

// SQL for creating the users table
const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`

// SQL for creating the pastes table
const createPastesTableSQL = `
CREATE TABLE IF NOT EXISTS pastes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    language TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    password_hash TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);`

// SQL for adding language column to existing pastes table
const addLanguageColumnSQL = `
ALTER TABLE pastes ADD COLUMN language TEXT;`
