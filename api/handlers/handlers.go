package handlers

import (
	"net/http"
	"strconv"

	"github.com/epuerta9/prompts.kitchenai/api/models"
	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

// Handler contains the dependencies for the API handlers
type Handler struct {
	Store *db.Store
}

// RegisterRoutes registers the API routes with the Echo instance
func RegisterRoutes(e *echo.Echo, store *db.Store) {
	h := &Handler{Store: store}

	// API routes
	api := e.Group("/api")

	// Prompts
	api.GET("/prompts", h.ListPrompts)
	api.POST("/prompts", h.CreatePrompt)
	api.GET("/prompts/:id", h.GetPrompt)
	api.PUT("/prompts/:id", h.UpdatePrompt)
	api.DELETE("/prompts/:id", h.DeletePrompt)

	// Versions
	api.GET("/prompts/:id/versions", h.ListVersions)
	api.POST("/prompts/:id/versions", h.CreateVersion)
	api.GET("/prompts/:id/versions/:version", h.GetVersion)

	// Comments
	api.GET("/prompts/:id/comments", h.ListComments)
	api.POST("/prompts/:id/comments", h.AddComment)

	// Evaluations
	api.POST("/prompts/:id/versions/:version/eval", h.CreateEvaluation)
	api.GET("/prompts/:id/versions/:version/evals", h.ListEvaluations)

	// Integration
	api.POST("/prompts/:id/versions/:version/integrate", h.IntegratePrompt)
}

// ListPrompts returns a list of all prompts
func (h *Handler) ListPrompts(c echo.Context) error {
	// TODO: Implement fetching from database
	prompts := []models.Prompt{
		{
			ID:          "1",
			Title:       "Example Prompt",
			Description: "This is an example prompt",
			CreatedBy:   models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
		},
	}
	return c.JSON(http.StatusOK, prompts)
}

// CreatePrompt creates a new prompt
func (h *Handler) CreatePrompt(c echo.Context) error {
	var prompt models.Prompt
	if err := c.Bind(&prompt); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Generate a new ID
	prompt.ID = uuid.New().String()

	// TODO: Insert into database

	return c.JSON(http.StatusCreated, prompt)
}

// GetPrompt returns a specific prompt
func (h *Handler) GetPrompt(c echo.Context) error {
	id := c.Param("id")

	// TODO: Fetch from database
	prompt := models.Prompt{
		ID:          id,
		Title:       "Example Prompt",
		Description: "This is an example prompt",
		CreatedBy:   models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
	}

	return c.JSON(http.StatusOK, prompt)
}

// UpdatePrompt updates a prompt
func (h *Handler) UpdatePrompt(c echo.Context) error {
	id := c.Param("id")

	var prompt models.Prompt
	if err := c.Bind(&prompt); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	prompt.ID = id

	// TODO: Update in database

	return c.JSON(http.StatusOK, prompt)
}

// DeletePrompt deletes a prompt
func (h *Handler) DeletePrompt(c echo.Context) error {
	id := c.Param("id")

	// TODO: Delete from database

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted", "id": id})
}

// ListVersions returns all versions of a prompt
func (h *Handler) ListVersions(c echo.Context) error {
	promptID := c.Param("id")

	// TODO: Fetch from database
	versions := []models.Version{
		{
			ID:        "v1",
			PromptID:  promptID,
			Version:   1,
			Content:   "This is version 1 of the prompt",
			CreatedBy: models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
		},
		{
			ID:        "v2",
			PromptID:  promptID,
			Version:   2,
			Content:   "This is version 2 of the prompt",
			CreatedBy: models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
		},
	}

	return c.JSON(http.StatusOK, versions)
}

// CreateVersion creates a new version of a prompt
func (h *Handler) CreateVersion(c echo.Context) error {
	promptID := c.Param("id")

	var version models.Version
	if err := c.Bind(&version); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Generate a new ID
	version.ID = uuid.New().String()
	version.PromptID = promptID

	// TODO: Insert into database and get next version number
	version.Version = 1

	return c.JSON(http.StatusCreated, version)
}

// GetVersion returns a specific version of a prompt
func (h *Handler) GetVersion(c echo.Context) error {
	promptID := c.Param("id")
	versionStr := c.Param("version")

	versionNum, err := strconv.Atoi(versionStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid version number"})
	}

	// TODO: Fetch from database
	version := models.Version{
		ID:        "v" + versionStr,
		PromptID:  promptID,
		Version:   versionNum,
		Content:   "This is version " + versionStr + " of the prompt",
		CreatedBy: models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
	}

	return c.JSON(http.StatusOK, version)
}

// ListComments returns all comments for a prompt
func (h *Handler) ListComments(c echo.Context) error {
	promptID := c.Param("id")

	// TODO: Fetch from database
	comments := []models.Comment{
		{
			ID:        "c1",
			PromptID:  promptID,
			Content:   "This is a comment",
			CreatedBy: models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
		},
	}

	return c.JSON(http.StatusOK, comments)
}

// AddComment adds a comment to a prompt
func (h *Handler) AddComment(c echo.Context) error {
	promptID := c.Param("id")

	var comment models.Comment
	if err := c.Bind(&comment); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// Generate a new ID
	comment.ID = uuid.New().String()
	comment.PromptID = promptID

	// TODO: Insert into database

	return c.JSON(http.StatusCreated, comment)
}

// CreateEvaluation creates an evaluation for a prompt version
func (h *Handler) CreateEvaluation(c echo.Context) error {
	// Get the prompt ID and version from the request
	_ = c.Param("id") // Use _ to acknowledge we're getting the value but not using it yet
	versionStr := c.Param("version")

	// Parse the version number but don't use it directly yet
	_, err := strconv.Atoi(versionStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid version number"})
	}

	var eval models.Eval
	if err := c.Bind(&eval); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	// TODO: Get version ID from database using promptID and versionNum
	// For now, just create a simple version ID
	versionID := "v" + versionStr

	// Generate a new ID
	eval.ID = uuid.New().String()
	eval.VersionID = versionID

	// TODO: Insert into database

	return c.JSON(http.StatusCreated, eval)
}

// ListEvaluations returns all evaluations for a prompt version
func (h *Handler) ListEvaluations(c echo.Context) error {
	// Get the prompt ID and version from the request
	_ = c.Param("id") // Use _ to acknowledge we're getting the value but not using it yet
	versionStr := c.Param("version")

	_, err := strconv.Atoi(versionStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid version number"})
	}

	// TODO: Get version ID from database using promptID and versionNum
	versionID := "v" + versionStr

	// TODO: Fetch from database
	evals := []models.Eval{
		{
			ID:        "e1",
			VersionID: versionID,
			Score:     0.85,
			Notes:     "This prompt works well",
			CreatedBy: models.User{ID: "user1", Name: "John Doe", Email: "john@example.com"},
		},
	}

	return c.JSON(http.StatusOK, evals)
}

// IntegratePrompt integrates a prompt version into the system
func (h *Handler) IntegratePrompt(c echo.Context) error {
	// Get the prompt ID and version from the request
	_ = c.Param("id") // Use _ to acknowledge we're getting the value but not using it yet
	versionStr := c.Param("version")

	// Parse the version number but don't use it directly yet
	_, err := strconv.Atoi(versionStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid version number"})
	}

	// TODO: Implement integration logic

	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}
