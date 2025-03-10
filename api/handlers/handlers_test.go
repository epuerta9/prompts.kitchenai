package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/epuerta9/prompts.kitchenai/api/models"
	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/epuerta9/prompts.kitchenai/db/sqlc"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockStore is a mock implementation of the database store for testing
type MockStore struct {
	mock.Mock
	*sqlc.Queries
	db *sql.DB
}

func NewMockStore() *MockStore {
	return &MockStore{
		Queries: &sqlc.Queries{},
	}
}

func (m *MockStore) Close() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockStore) ExecuteTx(ctx context.Context, fn func(*sqlc.Queries) error) error {
	args := m.Called(ctx, fn)
	return args.Error(0)
}

func setupTestDB(t testing.TB) *db.Store {
	// Get the project root directory
	workDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get working directory: %v", err)
	}

	// Go up to the project root
	for filepath.Base(workDir) != "prompts.kitchenai" && workDir != "/" {
		workDir = filepath.Dir(workDir)
	}

	if workDir == "/" {
		t.Fatal("failed to find project root directory")
	}

	// Change to the project root directory
	if err := os.Chdir(workDir); err != nil {
		t.Fatalf("failed to change to project root directory: %v", err)
	}

	// Set up test database
	dbPath := filepath.Join(workDir, "test.db")
	os.Setenv("SQLITE_URL", "file:"+dbPath+"?_foreign_keys=on")

	// Initialize the database
	store, err := db.Initialize()
	if err != nil {
		t.Fatalf("failed to initialize database: %v", err)
	}

	// Clean up function
	t.Cleanup(func() {
		store.Close()
		os.Remove(dbPath)
	})

	return store
}

func setupTestEcho(t testing.TB) (*echo.Echo, *httptest.ResponseRecorder, *db.Store) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	_ = e.NewContext(req, rec) // Using _ to avoid unused variable warning

	// Set up test database
	store := setupTestDB(t)
	return e, rec, store
}

func TestListPrompts(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/api/prompts", nil)
	c := e.NewContext(req, rec)

	// Test
	if assert.NoError(t, h.ListPrompts(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var prompts []models.Prompt
		err := json.Unmarshal(rec.Body.Bytes(), &prompts)
		assert.NoError(t, err)

		// Since we're using a real database, we just check if we got a valid response
		assert.NotNil(t, prompts)
	}
}

func TestCreatePrompt(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Create test data
	promptData := `{"title":"Test Prompt","description":"This is a test prompt"}`

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPost, "/api/prompts", strings.NewReader(promptData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c := e.NewContext(req, rec)

	// Test
	if assert.NoError(t, h.CreatePrompt(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)

		// Parse the response body
		var prompt models.Prompt
		err := json.Unmarshal(rec.Body.Bytes(), &prompt)
		assert.NoError(t, err)

		// Check that values match and ID was generated
		assert.Equal(t, "Test Prompt", prompt.Title)
		assert.Equal(t, "This is a test prompt", prompt.Description)
		assert.NotEmpty(t, prompt.ID)
	}
}

func TestGetPrompt(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.GetPrompt(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var prompt models.Prompt
		err := json.Unmarshal(rec.Body.Bytes(), &prompt)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, testID, prompt.ID)
	}
}

func TestUpdatePrompt(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create test data
	promptData := `{"title":"Updated Prompt","description":"This is an updated prompt"}`

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(promptData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.UpdatePrompt(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var prompt models.Prompt
		err := json.Unmarshal(rec.Body.Bytes(), &prompt)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, testID, prompt.ID)
		assert.Equal(t, "Updated Prompt", prompt.Title)
		assert.Equal(t, "This is an updated prompt", prompt.Description)
	}
}

func TestDeletePrompt(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodDelete, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.DeletePrompt(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var response map[string]string
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, "deleted", response["status"])
		assert.Equal(t, testID, response["id"])
	}
}

func TestListVersions(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.ListVersions(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var versions []models.Version
		err := json.Unmarshal(rec.Body.Bytes(), &versions)
		assert.NoError(t, err)

		// Check that values match
		assert.NotNil(t, versions)
	}
}

func TestCreateVersion(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create test data
	versionData := `{"content":"This is a new version of the prompt"}`

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(versionData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.CreateVersion(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)

		// Parse the response body
		var version models.Version
		err := json.Unmarshal(rec.Body.Bytes(), &version)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, testID, version.PromptID)
		assert.NotEmpty(t, version.ID)
	}
}

func TestGetVersion(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test IDs
	testPromptID := "1"
	testVersionStr := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions/:version")
	c.SetParamNames("id", "version")
	c.SetParamValues(testPromptID, testVersionStr)

	// Test
	if assert.NoError(t, h.GetVersion(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var version models.Version
		err := json.Unmarshal(rec.Body.Bytes(), &version)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, testPromptID, version.PromptID)
		assert.Equal(t, 1, version.Version)
	}
}

func TestListComments(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/comments")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.ListComments(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var comments []models.Comment
		err := json.Unmarshal(rec.Body.Bytes(), &comments)
		assert.NoError(t, err)

		// Check that values match
		assert.NotNil(t, comments)
	}
}

func TestAddComment(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test ID
	testID := "1"

	// Create test data
	commentData := `{"content":"This is a test comment"}`

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(commentData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/comments")
	c.SetParamNames("id")
	c.SetParamValues(testID)

	// Test
	if assert.NoError(t, h.AddComment(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)

		// Parse the response body
		var comment models.Comment
		err := json.Unmarshal(rec.Body.Bytes(), &comment)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, testID, comment.PromptID)
		assert.NotEmpty(t, comment.ID)
	}
}

func TestCreateEvaluation(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test IDs
	testPromptID := "1"
	testVersionStr := "1"

	// Create test data
	evalData := `{"score":5,"feedback":"This is a test evaluation"}`

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(evalData))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions/:version/eval")
	c.SetParamNames("id", "version")
	c.SetParamValues(testPromptID, testVersionStr)

	// Test
	if assert.NoError(t, h.CreateEvaluation(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)

		// Parse the response body
		var eval models.Eval
		err := json.Unmarshal(rec.Body.Bytes(), &eval)
		assert.NoError(t, err)

		// Check that values match
		assert.NotEmpty(t, eval.ID)
		assert.NotEmpty(t, eval.VersionID)
	}
}

func TestListEvaluations(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test IDs
	testPromptID := "1"
	testVersionStr := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions/:version/evals")
	c.SetParamNames("id", "version")
	c.SetParamValues(testPromptID, testVersionStr)

	// Test
	if assert.NoError(t, h.ListEvaluations(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var evals []models.Eval
		err := json.Unmarshal(rec.Body.Bytes(), &evals)
		assert.NoError(t, err)

		// Check that values match
		assert.NotNil(t, evals)
	}
}

func TestIntegratePrompt(t *testing.T) {
	// Setup
	e, rec, store := setupTestEcho(t)
	h := &Handler{Store: store}

	// Test IDs
	testPromptID := "1"
	testVersionStr := "1"

	// Create a request to pass to our handler
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	c := e.NewContext(req, rec)
	c.SetPath("/api/prompts/:id/versions/:version/integrate")
	c.SetParamNames("id", "version")
	c.SetParamValues(testPromptID, testVersionStr)

	// Test
	if assert.NoError(t, h.IntegratePrompt(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)

		// Parse the response body
		var response map[string]string
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)

		// Check that values match
		assert.Equal(t, "success", response["status"])
	}
}
