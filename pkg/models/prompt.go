package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

// Prompt represents a prompt template
type Prompt struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedBy   User      `json:"created_by"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
	Versions    []Version `json:"versions,omitempty"`
	Comments    []Comment `json:"comments,omitempty"`
}

// MessageRole defines the role of a message in a conversation
type MessageRole string

const (
	SystemRole    MessageRole = "system"
	UserRole      MessageRole = "user"
	AssistantRole MessageRole = "assistant"
)

// Message represents a single message in a conversation
type Message struct {
	Role    MessageRole `json:"role"`
	Content string      `json:"content"`
}

// Version represents a version of a prompt
type Version struct {
	ID        string    `json:"id"`
	PromptID  string    `json:"prompt_id"`
	Version   int       `json:"version"`
	Messages  []Message `json:"messages"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	Evals     []Eval    `json:"evals,omitempty"`
}

// Comment represents a comment on a prompt
type Comment struct {
	ID        string    `json:"id"`
	PromptID  string    `json:"prompt_id"`
	Content   string    `json:"content"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

// Eval represents an evaluation of a prompt version
type Eval struct {
	ID        string    `json:"id"`
	VersionID string    `json:"version_id"`
	Score     float64   `json:"score"`
	Notes     string    `json:"notes"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

// PromptRequest represents the request body for creating/updating a prompt
type PromptRequest struct {
	ID          string    `json:"id,omitempty"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedBy   User      `json:"created_by"`
	Messages    []Message `json:"messages,omitempty"`
}

// VersionRequest represents the request body for creating a new version
type VersionRequest struct {
	ID        string    `json:"id,omitempty"`
	Messages  []Message `json:"messages"`
	CreatedBy User      `json:"created_by"`
}

// CommentRequest represents the request body for adding a comment
type CommentRequest struct {
	ID        string `json:"id,omitempty"`
	Content   string `json:"content"`
	CreatedBy User   `json:"created_by"`
}

// EvalRequest represents the request body for creating an evaluation
type EvalRequest struct {
	ID        string  `json:"id,omitempty"`
	Score     float64 `json:"score"`
	Notes     string  `json:"notes"`
	CreatedBy User    `json:"created_by"`
}

// RunPromptRequest represents the request to run a prompt with a specific model
type RunPromptRequest struct {
	Messages    []Message `json:"messages"`
	Model       string    `json:"model"`
	Temperature float64   `json:"temperature"`
	MaxTokens   int       `json:"max_tokens"`
	TopP        float64   `json:"top_p"`
}

// RunPromptResponse represents the response from running a prompt
type RunPromptResponse struct {
	Response string `json:"response"`
	Model    string `json:"model"`
	Usage    struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// IntegrationRequest represents a request to integrate a prompt into a file
type IntegrationRequest struct {
	FilePath string `json:"file_path"`
}

// IntegrationResult represents the result of integrating a prompt
type IntegrationResult struct {
	Success      bool   `json:"success"`
	Message      string `json:"message"`
	FilePath     string `json:"file_path"`
	PromptID     string `json:"prompt_id"`
	VersionNum   int    `json:"version"`
	BackupPath   string `json:"backup_path,omitempty"`
	LinesChanged int    `json:"lines_changed"`
}
