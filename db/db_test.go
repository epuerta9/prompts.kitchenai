package db

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitialize(t *testing.T) {
	// Set test database URL
	os.Setenv("SQLITE_URL", "file:./test.db?_foreign_keys=on")

	// Initialize the database
	store, err := Initialize()

	// Assert no error occurred
	assert.NoError(t, err)
	assert.NotNil(t, store)

	// Clean up
	defer os.Remove("./test.db")
	defer store.db.Close()
}

func TestMigrateDB(t *testing.T) {
	// Set test database URL
	os.Setenv("SQLITE_URL", "file:./migrate_test.db?_foreign_keys=on")

	// Initialize the database
	store, err := Initialize()
	assert.NoError(t, err)

	// Verify tables exist
	tables := []string{"users", "prompts", "prompt_versions", "comments", "evaluations"}

	for _, table := range tables {
		// Check if table exists by running a simple query
		query := "SELECT 1 FROM " + table + " LIMIT 1"
		_, err := store.db.Query(query)
		assert.NoError(t, err, "Table %s should exist", table)
	}

	// Clean up
	defer os.Remove("./migrate_test.db")
	defer store.db.Close()
}

func TestClose(t *testing.T) {
	// Set test database URL
	os.Setenv("SQLITE_URL", "file:./close_test.db?_foreign_keys=on")

	// Initialize the database
	store, err := Initialize()
	assert.NoError(t, err)

	// Close the database
	err = store.db.Close()
	assert.NoError(t, err)

	// Clean up
	defer os.Remove("./close_test.db")
}
