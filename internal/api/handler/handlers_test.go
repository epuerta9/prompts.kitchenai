package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/epuerta9/prompts.kitchenai/db/sqlc"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Custom type to handle time fields in JSON responses
type testPrompt struct {
	ID          string          `json:"id"`
	Title       string          `json:"title"`
	Description sql.NullString  `json:"description"`
	CreatedBy   sql.NullString  `json:"created_by"`
	CreatedAt   json.RawMessage `json:"created_at"`
	UpdatedAt   json.RawMessage `json:"updated_at"`
}

type testVersion struct {
	ID        string          `json:"id"`
	PromptID  sql.NullString  `json:"prompt_id"`
	Version   int64           `json:"version"`
	Content   string          `json:"content"`
	CreatedBy sql.NullString  `json:"created_by"`
	CreatedAt json.RawMessage `json:"created_at"`
}

type testComment struct {
	ID        string          `json:"id"`
	PromptID  sql.NullString  `json:"prompt_id"`
	Content   string          `json:"content"`
	CreatedBy sql.NullString  `json:"created_by"`
	CreatedAt json.RawMessage `json:"created_at"`
}

type testEval struct {
	ID              string          `json:"id"`
	PromptVersionID sql.NullString  `json:"prompt_version_id"`
	Score           sql.NullFloat64 `json:"score"`
	Notes           sql.NullString  `json:"notes"`
	CreatedBy       sql.NullString  `json:"created_by"`
	CreatedAt       json.RawMessage `json:"created_at"`
}

func setupTestDB(t testing.TB) (*db.Store, func()) {
	// Get the project root directory
	workDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get working directory: %v", err)
	}

	// Go up to project root (3 levels up from internal/api/handler)
	projectRoot := filepath.Join(workDir, "..", "..", "..")

	// Change to project root directory
	if err := os.Chdir(projectRoot); err != nil {
		t.Fatalf("Failed to change to project root directory: %v", err)
	}

	// Create a temporary directory for the test database
	tmpDir, err := os.MkdirTemp("", "test-db-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	// Create a path for the test database
	dbPath := filepath.Join(tmpDir, "test.db")

	// Initialize the database
	sqlDB, err := db.Connect("file:" + dbPath + "?_foreign_keys=on")
	require.NoError(t, err)

	// Run migrations
	err = db.RunMigrations(sqlDB)
	if err != nil {
		sqlDB.Close()
		os.RemoveAll(tmpDir)
		t.Fatalf("Failed to run migrations: %v", err)
	}

	// Create store
	store := db.NewStore(sqlDB)

	// Return the store and a cleanup function
	cleanup := func() {
		store.Close()
		os.RemoveAll(tmpDir)
		// Change back to original directory
		os.Chdir(workDir)
	}
	return store, cleanup
}

func TestGetPrompts(t *testing.T) {
	// Setup
	store, cleanup := setupTestDB(t)
	defer cleanup()

	e := echo.New()
	h := NewHandler(store)

	// Create a test prompt
	prompt := sqlc.CreatePromptParams{
		ID:          "test-prompt",
		Title:       "Test Prompt",
		Description: sql.NullString{String: "Test Description", Valid: true},
		CreatedBy:   sql.NullString{String: "test-user", Valid: true},
	}
	_, err := store.CreatePrompt(context.Background(), prompt)
	require.NoError(t, err)

	// Test GET /prompts
	req := httptest.NewRequest(http.MethodGet, "/prompts", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// Assertions
	require.NoError(t, h.GetPrompts(c))
	assert.Equal(t, http.StatusOK, rec.Code)

	var response []testPrompt
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
	assert.Equal(t, prompt.ID, response[0].ID)
	assert.Equal(t, prompt.Title, response[0].Title)
	assert.Equal(t, prompt.Description.String, response[0].Description.String)
}

func TestGetVersions(t *testing.T) {
	// Setup
	store, cleanup := setupTestDB(t)
	defer cleanup()

	e := echo.New()
	h := NewHandler(store)

	// Create a test prompt and version
	prompt := sqlc.CreatePromptParams{
		ID:          "test-prompt",
		Title:       "Test Prompt",
		Description: sql.NullString{String: "Test Description", Valid: true},
		CreatedBy:   sql.NullString{String: "test-user", Valid: true},
	}
	_, err := store.CreatePrompt(context.Background(), prompt)
	require.NoError(t, err)

	messages := []map[string]string{
		{"role": "user", "content": "test"},
	}
	messagesJSON, _ := json.Marshal(messages)

	version := sqlc.CreateVersionParams{
		ID:        "test-version",
		PromptID:  sql.NullString{String: prompt.ID, Valid: true},
		Version:   1,
		Content:   string(messagesJSON),
		CreatedBy: sql.NullString{String: "test-user", Valid: true},
	}
	_, err = store.CreateVersion(context.Background(), version)
	require.NoError(t, err)

	// Test GET /prompts/:id/versions
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/prompts/:id/versions")
	c.SetParamNames("id")
	c.SetParamValues(prompt.ID)

	// Assertions
	require.NoError(t, h.GetVersions(c))
	assert.Equal(t, http.StatusOK, rec.Code)

	var response []testVersion
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
	assert.Equal(t, version.ID, response[0].ID)
	assert.Equal(t, version.Version, response[0].Version)
}

func TestGetComments(t *testing.T) {
	// Setup
	store, cleanup := setupTestDB(t)
	defer cleanup()

	e := echo.New()
	h := NewHandler(store)

	// Create a test prompt and comment
	prompt := sqlc.CreatePromptParams{
		ID:          "test-prompt",
		Title:       "Test Prompt",
		Description: sql.NullString{String: "Test Description", Valid: true},
		CreatedBy:   sql.NullString{String: "test-user", Valid: true},
	}
	_, err := store.CreatePrompt(context.Background(), prompt)
	require.NoError(t, err)

	comment := sqlc.CreateCommentParams{
		ID:        "test-comment",
		PromptID:  sql.NullString{String: prompt.ID, Valid: true},
		Content:   "Test Comment",
		CreatedBy: sql.NullString{String: "test-user", Valid: true},
	}
	_, err = store.CreateComment(context.Background(), comment)
	require.NoError(t, err)

	// Test GET /prompts/:id/comments
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/prompts/:id/comments")
	c.SetParamNames("id")
	c.SetParamValues(prompt.ID)

	// Assertions
	require.NoError(t, h.GetComments(c))
	assert.Equal(t, http.StatusOK, rec.Code)

	var response []testComment
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
	assert.Equal(t, comment.ID, response[0].ID)
	assert.Equal(t, comment.Content, response[0].Content)
}

func TestGetEvaluations(t *testing.T) {
	// Setup
	store, cleanup := setupTestDB(t)
	defer cleanup()

	e := echo.New()
	h := NewHandler(store)

	// Create a test prompt, version, and evaluation
	prompt := sqlc.CreatePromptParams{
		ID:          "test-prompt",
		Title:       "Test Prompt",
		Description: sql.NullString{String: "Test Description", Valid: true},
		CreatedBy:   sql.NullString{String: "test-user", Valid: true},
	}
	_, err := store.CreatePrompt(context.Background(), prompt)
	require.NoError(t, err)

	messages := []map[string]string{
		{"role": "user", "content": "test"},
	}
	messagesJSON, _ := json.Marshal(messages)

	version := sqlc.CreateVersionParams{
		ID:        "test-version",
		PromptID:  sql.NullString{String: prompt.ID, Valid: true},
		Version:   1,
		Content:   string(messagesJSON),
		CreatedBy: sql.NullString{String: "test-user", Valid: true},
	}
	_, err = store.CreateVersion(context.Background(), version)
	require.NoError(t, err)

	eval := sqlc.CreateEvaluationParams{
		ID:              "test-eval",
		PromptVersionID: sql.NullString{String: version.ID, Valid: true},
		Score:           sql.NullFloat64{Float64: 4.5, Valid: true},
		Notes:           sql.NullString{String: "Test Notes", Valid: true},
		CreatedBy:       sql.NullString{String: "test-user", Valid: true},
	}
	_, err = store.CreateEvaluation(context.Background(), eval)
	require.NoError(t, err)

	// Test GET /prompts/:id/versions/:version/evals
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/prompts/:id/versions/:version/evals")
	c.SetParamNames("id", "version")
	c.SetParamValues(prompt.ID, fmt.Sprint(version.Version))

	// Assertions
	require.NoError(t, h.GetEvaluations(c))
	assert.Equal(t, http.StatusOK, rec.Code)

	var response []testEval
	err = json.Unmarshal(rec.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Len(t, response, 1)
	assert.Equal(t, eval.ID, response[0].ID)
	assert.Equal(t, eval.Score.Float64, response[0].Score.Float64)
	assert.Equal(t, eval.Notes.String, response[0].Notes.String)
}
