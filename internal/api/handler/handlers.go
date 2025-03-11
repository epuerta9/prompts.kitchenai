package handler

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/epuerta9/prompts.kitchenai/db"
	"github.com/epuerta9/prompts.kitchenai/db/sqlc"
	"github.com/epuerta9/prompts.kitchenai/pkg/models"
)

// Handler contains the dependencies for the API handlers
type Handler struct {
	Store *db.Store
}

// NewHandler creates a new handler with the given store
func NewHandler(store *db.Store) *Handler {
	return &Handler{
		Store: store,
	}
}

// GetPrompts returns all prompts
func (h *Handler) GetPrompts(c echo.Context) error {
	prompts, err := h.Store.ListPrompts(c.Request().Context())
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompts: "+err.Error())
	}

	return c.JSON(http.StatusOK, prompts)
}

// GetPrompt returns a specific prompt by ID
func (h *Handler) GetPrompt(c echo.Context) error {
	id := c.Param("id")

	prompt, err := h.Store.GetPrompt(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	return c.JSON(http.StatusOK, prompt)
}

// Convert models.Message to string JSON for storage
func toDBMessages(msgs []models.Message) string {
	dbMsgs := make([]map[string]string, len(msgs))
	for i, msg := range msgs {
		dbMsgs[i] = map[string]string{
			"role":    string(msg.Role),
			"content": msg.Content,
		}
	}
	messagesJSON, _ := json.Marshal(dbMsgs)
	return string(messagesJSON)
}

// CreatePrompt creates a new prompt
func (h *Handler) CreatePrompt(c echo.Context) error {
	var req models.PromptRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Validate required fields
	if req.Title == "" || req.Description == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "Title and description are required")
	}

	// Create a new prompt
	prompt := sqlc.CreatePromptParams{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: sql.NullString{String: req.Description, Valid: true},
		CreatedBy:   sql.NullString{String: req.CreatedBy.ID, Valid: true},
	}

	// Save to database
	result, err := h.Store.CreatePrompt(c.Request().Context(), prompt)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create prompt: "+err.Error())
	}

	// If messages are provided, create an initial version
	if len(req.Messages) > 0 {
		version := sqlc.CreateVersionParams{
			ID:        uuid.New().String(),
			PromptID:  sql.NullString{String: result.ID, Valid: true},
			Version:   1,
			Content:   toDBMessages(req.Messages),
			CreatedBy: sql.NullString{String: req.CreatedBy.ID, Valid: true},
		}

		_, err := h.Store.CreateVersion(c.Request().Context(), version)
		if err != nil {
			// Log the error but don't fail the request
			c.Logger().Errorf("Failed to create initial version: %v", err)
		}
	}

	return c.JSON(http.StatusCreated, result)
}

// UpdatePrompt updates an existing prompt
func (h *Handler) UpdatePrompt(c echo.Context) error {
	id := c.Param("id")

	var req models.PromptRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Get existing prompt
	existingPrompt, err := h.Store.GetPrompt(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Update fields
	params := sqlc.UpdatePromptParams{
		ID:          existingPrompt.ID,
		Title:       req.Title,
		Description: sql.NullString{String: req.Description, Valid: true},
	}

	// Save to database
	result, err := h.Store.UpdatePrompt(c.Request().Context(), params)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to update prompt: "+err.Error())
	}

	return c.JSON(http.StatusOK, result)
}

// DeletePrompt deletes a prompt
func (h *Handler) DeletePrompt(c echo.Context) error {
	id := c.Param("id")

	// Check if prompt exists
	_, err := h.Store.GetPrompt(c.Request().Context(), id)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Delete from database
	err = h.Store.DeletePrompt(c.Request().Context(), id)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to delete prompt: "+err.Error())
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "deleted", "id": id})
}

// GetVersions returns all versions of a prompt
func (h *Handler) GetVersions(c echo.Context) error {
	promptID := c.Param("id")

	// Check if prompt exists
	_, err := h.Store.GetPrompt(c.Request().Context(), promptID)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Get versions from database
	versions, err := h.Store.ListVersions(c.Request().Context(), sql.NullString{String: promptID, Valid: true})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch versions: "+err.Error())
	}

	return c.JSON(http.StatusOK, versions)
}

// GetVersion returns a specific version of a prompt
func (h *Handler) GetVersion(c echo.Context) error {
	promptID := c.Param("id")
	versionStr := c.Param("version")

	// Parse version number
	versionNum, err := strconv.ParseInt(versionStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid version number")
	}

	// Get version from database
	version, err := h.Store.GetVersionByPromptAndNumber(c.Request().Context(), sqlc.GetVersionByPromptAndNumberParams{
		PromptID: sql.NullString{String: promptID, Valid: true},
		Version:  versionNum,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Version not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch version: "+err.Error())
	}

	return c.JSON(http.StatusOK, version)
}

// GetComments returns all comments for a prompt
func (h *Handler) GetComments(c echo.Context) error {
	promptID := c.Param("id")

	// Check if prompt exists
	_, err := h.Store.GetPrompt(c.Request().Context(), promptID)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Get comments from database
	comments, err := h.Store.ListComments(c.Request().Context(), sql.NullString{String: promptID, Valid: true})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch comments: "+err.Error())
	}

	return c.JSON(http.StatusOK, comments)
}

// CreateVersion creates a new version of a prompt
func (h *Handler) CreateVersion(c echo.Context) error {
	promptID := c.Param("id")

	var req models.VersionRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Check if prompt exists
	_, err := h.Store.GetPrompt(c.Request().Context(), promptID)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Get latest version number
	latestVersion, err := h.Store.GetLatestVersionNumber(c.Request().Context(), sql.NullString{String: promptID, Valid: true})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch versions: "+err.Error())
	}

	// Convert interface{} to int64
	var nextVersion int64 = 1
	if v, ok := latestVersion.(int64); ok {
		nextVersion = v + 1
	}

	// Create new version
	version := sqlc.CreateVersionParams{
		ID:        req.ID,
		PromptID:  sql.NullString{String: promptID, Valid: true},
		Version:   nextVersion,
		Content:   toDBMessages(req.Messages),
		CreatedBy: sql.NullString{String: req.CreatedBy.ID, Valid: true},
	}

	// If no ID provided, generate one
	if version.ID == "" {
		version.ID = uuid.New().String()
	}

	// Save to database
	result, err := h.Store.CreateVersion(c.Request().Context(), version)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create version: "+err.Error())
	}

	return c.JSON(http.StatusCreated, result)
}

// AddComment adds a comment to a prompt
func (h *Handler) AddComment(c echo.Context) error {
	promptID := c.Param("id")

	var req models.CommentRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Check if prompt exists
	_, err := h.Store.GetPrompt(c.Request().Context(), promptID)
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Prompt not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch prompt: "+err.Error())
	}

	// Create new comment
	comment := sqlc.CreateCommentParams{
		ID:        req.ID,
		PromptID:  sql.NullString{String: promptID, Valid: true},
		Content:   req.Content,
		CreatedBy: sql.NullString{String: req.CreatedBy.ID, Valid: true},
	}

	// If no ID provided, generate one
	if comment.ID == "" {
		comment.ID = uuid.New().String()
	}

	// Save to database
	result, err := h.Store.CreateComment(c.Request().Context(), comment)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create comment: "+err.Error())
	}

	return c.JSON(http.StatusCreated, result)
}

// CreateEvaluation creates a new evaluation for a version
func (h *Handler) CreateEvaluation(c echo.Context) error {
	promptID := c.Param("id")
	versionStr := c.Param("version")

	var req models.EvalRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// Parse version number
	versionNum, err := strconv.ParseInt(versionStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid version number")
	}

	// Get version
	version, err := h.Store.GetVersionByPromptAndNumber(c.Request().Context(), sqlc.GetVersionByPromptAndNumberParams{
		PromptID: sql.NullString{String: promptID, Valid: true},
		Version:  versionNum,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Version not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch version: "+err.Error())
	}

	// Create new evaluation
	eval := sqlc.CreateEvaluationParams{
		ID:              req.ID,
		PromptVersionID: sql.NullString{String: version.ID, Valid: true},
		Score:           sql.NullFloat64{Float64: req.Score, Valid: true},
		Notes:           sql.NullString{String: req.Notes, Valid: true},
		CreatedBy:       sql.NullString{String: req.CreatedBy.ID, Valid: true},
	}

	// If no ID provided, generate one
	if eval.ID == "" {
		eval.ID = uuid.New().String()
	}

	// Save to database
	result, err := h.Store.CreateEvaluation(c.Request().Context(), eval)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to create evaluation: "+err.Error())
	}

	return c.JSON(http.StatusCreated, result)
}

// GetEvaluations returns all evaluations for a prompt version
func (h *Handler) GetEvaluations(c echo.Context) error {
	promptID := c.Param("id")
	versionStr := c.Param("version")

	// Parse version number
	versionNum, err := strconv.ParseInt(versionStr, 10, 64)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid version number")
	}

	// Get version
	version, err := h.Store.GetVersionByPromptAndNumber(c.Request().Context(), sqlc.GetVersionByPromptAndNumberParams{
		PromptID: sql.NullString{String: promptID, Valid: true},
		Version:  versionNum,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return echo.NewHTTPError(http.StatusNotFound, "Version not found")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch version: "+err.Error())
	}

	// Get evaluations from database
	evals, err := h.Store.ListEvaluations(c.Request().Context(), sql.NullString{String: version.ID, Valid: true})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "Failed to fetch evaluations: "+err.Error())
	}

	return c.JSON(http.StatusOK, evals)
}

// RunPrompt runs a prompt with a specific model
func (h *Handler) RunPrompt(c echo.Context) error {
	var req models.RunPromptRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid request body: "+err.Error())
	}

	// In a real app, you would call the LLM API here
	// For now, we'll just return a mock response
	response := models.RunPromptResponse{
		Response: "This is a mock response from the LLM API. In a real app, this would be the actual response from the model.",
		Model:    req.Model,
		Usage: struct {
			PromptTokens     int `json:"prompt_tokens"`
			CompletionTokens int `json:"completion_tokens"`
			TotalTokens      int `json:"total_tokens"`
		}{
			PromptTokens:     150,
			CompletionTokens: 200,
			TotalTokens:      350,
		},
	}

	return c.JSON(http.StatusOK, response)
}
