package services

import (
	"log"
	"time"

	"github.com/LonleySailor/privatepaste/backend/internal/models"
)

// CleanupService handles automatic cleanup of expired pastes
type CleanupService struct {
	pasteRepo *models.PasteRepository
	ticker    *time.Ticker
	stopChan  chan struct{}
	interval  time.Duration
}

// NewCleanupService creates a new cleanup service
func NewCleanupService(pasteRepo *models.PasteRepository) *CleanupService {
	return &CleanupService{
		pasteRepo: pasteRepo,
		interval:  time.Hour, // Run cleanup every hour
		stopChan:  make(chan struct{}),
	}
}

// Start starts the cleanup service background worker
func (s *CleanupService) Start() {
	log.Println("Starting cleanup service...")
	s.ticker = time.NewTicker(s.interval)

	go func() {
		for {
			select {
			case <-s.ticker.C:
				s.cleanupExpiredPastes()
			case <-s.stopChan:
				s.ticker.Stop()
				log.Println("Cleanup service stopped")
				return
			}
		}
	}()

	log.Printf("Cleanup service started with %v interval", s.interval)
}

// Stop stops the cleanup service
func (s *CleanupService) Stop() {
	if s.stopChan != nil {
		close(s.stopChan)
	}
}

// cleanupExpiredPastes removes all expired pastes from the database
func (s *CleanupService) cleanupExpiredPastes() {
	log.Println("Running expired paste cleanup...")

	deletedCount, err := s.pasteRepo.DeleteExpired()
	if err != nil {
		log.Printf("Error during paste cleanup: %v", err)
		return
	}

	if deletedCount > 0 {
		log.Printf("Cleanup completed: %d expired pastes deleted", deletedCount)
	} else {
		log.Println("Cleanup completed: no expired pastes found")
	}
}

// RunManualCleanup manually runs the cleanup process
func (s *CleanupService) RunManualCleanup() error {
	log.Println("Running manual cleanup...")
	s.cleanupExpiredPastes()
	return nil
}
