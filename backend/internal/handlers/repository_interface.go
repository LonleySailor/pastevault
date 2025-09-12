package handlers

import "github.com/LonleySailor/pastevault/backend/internal/models"

// PasteRepositoryInterface defines the interface for paste repository operations
type PasteRepositoryInterface interface {
	Create(paste *models.Paste) error
	GetByID(id string) (*models.Paste, error)
	Exists(id string) (bool, error)
	Delete(id string) error
	GetByUserID(userID int, limit, offset int) ([]*models.Paste, error)
	Update(paste *models.Paste) error
	DeleteExpired() (int64, error)
}
