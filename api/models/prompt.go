package models

import (
	"time"
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// Prompt represents a prompt in the system
type Prompt struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedBy   User      `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Versions    []Version `json:"versions,omitempty"`
	Comments    []Comment `json:"comments,omitempty"`
}

// Version represents a version of a prompt
type Version struct {
	ID        string    `json:"id"`
	PromptID  string    `json:"prompt_id"`
	Version   int       `json:"version"`
	Content   string    `json:"content"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	Evals     []Eval    `json:"evals,omitempty"`
}

// Comment represents a comment on a prompt
type Comment struct {
	ID        string    `json:"id"`
	PromptID  string    `json:"prompt_id"`
	Content   string    `json:"content"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

// Eval represents an evaluation of a prompt version
type Eval struct {
	ID        string    `json:"id"`
	VersionID string    `json:"version_id"`
	Score     float64   `json:"score"`
	Notes     string    `json:"notes"`
	CreatedBy User      `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
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
