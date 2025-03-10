package db

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const (
	migrationsDir = "db/migration"
)

// RunMigrations runs migrations for the database
func RunMigrations(db *sql.DB) error {
	// Create migrations instance
	driver, err := sqlite.WithInstance(db, &sqlite.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migrations driver: %w", err)
	}

	// Get the absolute path to the migrations directory
	workDir, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	// If we're in a test directory, go up one level
	if filepath.Base(workDir) == "api" || filepath.Base(workDir) == "db" {
		workDir = filepath.Dir(workDir)
	}

	absPath := filepath.Join(workDir, migrationsDir)

	// Check if migrations directory exists
	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		return fmt.Errorf("migrations directory not found: %s", absPath)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", absPath),
		"sqlite",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrations instance: %w", err)
	}

	// Run migrations
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("Migrations applied successfully")
	return nil
}

// CreateMigration creates a new migration file
func CreateMigration(name string) error {
	// Create migrations directory if it doesn't exist
	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		return fmt.Errorf("failed to create migrations directory: %w", err)
	}

	timestamp := GetTimestamp()
	upFileName := filepath.Join(migrationsDir, fmt.Sprintf("%d_%s.up.sql", timestamp, name))
	downFileName := filepath.Join(migrationsDir, fmt.Sprintf("%d_%s.down.sql", timestamp, name))

	// Create up file
	upFile, err := os.Create(upFileName)
	if err != nil {
		return fmt.Errorf("failed to create up migration file: %w", err)
	}
	defer upFile.Close()

	// Create down file
	downFile, err := os.Create(downFileName)
	if err != nil {
		return fmt.Errorf("failed to create down migration file: %w", err)
	}
	defer downFile.Close()

	log.Printf("Created migration files: %s, %s", upFileName, downFileName)
	return nil
}

// GetTimestamp returns the current timestamp
func GetTimestamp() int64 {
	return time.Now().Unix()
}
