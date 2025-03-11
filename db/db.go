package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	"github.com/epuerta9/prompts.kitchenai/db/sqlc"
	_ "modernc.org/sqlite"
)

// Store provides all functions to execute database queries and transactions
type Store struct {
	*sqlc.Queries
	db *sql.DB
}

// NewStore creates a new store with the given database connection
func NewStore(db *sql.DB) *Store {
	return &Store{
		db:      db,
		Queries: sqlc.New(db),
	}
}

// Connect opens a database connection with the given DSN
func Connect(dataSourceName string) (*sql.DB, error) {
	if dataSourceName == "" {
		dataSourceName = DefaultDataSourceName()
	}

	// Ensure directory exists
	dir := filepath.Dir(dataSourceName)
	if dir != "." && dir != "" && !filepath.IsAbs(dataSourceName) && !isURIScheme(dataSourceName) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create directory: %w", err)
		}
	}

	db, err := sql.Open("sqlite", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to open db connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping db: %w", err)
	}

	return db, nil
}

// DefaultDataSourceName returns the default data source name
func DefaultDataSourceName() string {
	dsn := os.Getenv("SQLITE_URL")
	if dsn == "" {
		dsn = "file:./data/prompts.db?_foreign_keys=on"
	}
	return dsn
}

// isURIScheme checks if the string starts with a URI scheme
func isURIScheme(s string) bool {
	for i := 0; i < len(s); i++ {
		if s[i] == ':' {
			return true
		}
		if s[i] == '/' || s[i] == '.' {
			return false
		}
	}
	return false
}

// ExecuteTx executes a function within a database transaction
func (s *Store) ExecuteTx(ctx context.Context, fn func(*sqlc.Queries) error) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	q := sqlc.New(tx)
	err = fn(q)
	if err != nil {
		if rbErr := tx.Rollback(); rbErr != nil {
			return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
		}
		return err
	}

	return tx.Commit()
}

// Initialize creates a new database connection and runs migrations
func Initialize() (*Store, error) {
	db, err := Connect(DefaultDataSourceName())
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := RunMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return NewStore(db), nil
}

// Close closes the database connection
func (s *Store) Close() error {
	return s.db.Close()
}
