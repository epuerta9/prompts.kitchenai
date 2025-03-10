package prompt

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/epuerta9/prompts.kitchenai/api/models"
)

// Client is the client for interacting with the prompt server API
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
	AuthToken  string
}

// Comment represents a comment on a prompt
type Comment struct {
	Content string `json:"content"`
}

// IntegrationRequest represents a request to integrate a prompt
type IntegrationRequest struct {
	FilePath string `json:"file_path"`
}

// NewClient creates a new prompt client
func NewClient(baseURL string) *Client {
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SetAuthToken sets the authentication token for the client
func (c *Client) SetAuthToken(token string) {
	c.AuthToken = token
}

// ListPrompts returns a list of all prompts
func (c *Client) ListPrompts() ([]models.Prompt, error) {
	resp, err := c.sendRequest("GET", "/api/prompts", nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var prompts []models.Prompt
	if err := json.NewDecoder(resp.Body).Decode(&prompts); err != nil {
		return nil, err
	}

	return prompts, nil
}

// GetPrompt returns a specific prompt
func (c *Client) GetPrompt(id string) (*models.Prompt, error) {
	resp, err := c.sendRequest("GET", fmt.Sprintf("/api/prompts/%s", id), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var prompt models.Prompt
	if err := json.NewDecoder(resp.Body).Decode(&prompt); err != nil {
		return nil, err
	}

	return &prompt, nil
}

// ListPromptVersions returns a list of all versions for a prompt
func (c *Client) ListPromptVersions(promptID string) ([]models.Version, error) {
	resp, err := c.sendRequest("GET", fmt.Sprintf("/api/prompts/%s/versions", promptID), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var versions []models.Version
	if err := json.NewDecoder(resp.Body).Decode(&versions); err != nil {
		return nil, err
	}

	return versions, nil
}

// GetPromptVersion returns a specific version of a prompt
func (c *Client) GetPromptVersion(promptID, version string) (*models.Version, error) {
	resp, err := c.sendRequest("GET", fmt.Sprintf("/api/prompts/%s/versions/%s", promptID, version), nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var ver models.Version
	if err := json.NewDecoder(resp.Body).Decode(&ver); err != nil {
		return nil, err
	}

	return &ver, nil
}

// AddComment adds a comment to a prompt
func (c *Client) AddComment(promptID string, comment Comment) error {
	data, err := json.Marshal(comment)
	if err != nil {
		return err
	}

	resp, err := c.sendRequest("POST", fmt.Sprintf("/api/prompts/%s/comments", promptID), bytes.NewBuffer(data))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		body, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("failed to add comment: %s", body)
	}

	return nil
}

// IntegratePrompt integrates a prompt into a file
func (c *Client) IntegratePrompt(promptID, version, filePath string) (*models.IntegrationResult, error) {
	// First, get the prompt content
	promptVer, err := c.GetPromptVersion(promptID, version)
	if err != nil {
		return nil, fmt.Errorf("failed to get prompt version: %w", err)
	}

	// Check if file exists
	absPath, err := filepath.Abs(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get absolute path: %w", err)
	}

	_, err = os.Stat(absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to access file %s: %w", absPath, err)
	}

	// Create backup
	backupPath := absPath + ".bak"
	input, err := ioutil.ReadFile(absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	err = ioutil.WriteFile(backupPath, input, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to create backup: %w", err)
	}

	// Simple integration - replace prompt tags with new content
	fileContent := string(input)
	promptTag := fmt.Sprintf("// PROMPT:%s", promptID)
	endTag := "// PROMPT:END"

	startIdx := strings.Index(fileContent, promptTag)
	endIdx := strings.Index(fileContent, endTag)

	if startIdx == -1 || endIdx == -1 || startIdx > endIdx {
		return nil, fmt.Errorf("couldn't find prompt tags in file")
	}

	// Count lines that will be changed
	oldContent := fileContent[startIdx+len(promptTag) : endIdx]
	oldLines := strings.Count(oldContent, "\n") + 1

	// Replace the content
	newContent := fmt.Sprintf("%s\n%s\n%s", promptTag, promptVer.Content, endTag)
	newFileContent := fileContent[:startIdx] + newContent + fileContent[endIdx+len(endTag):]

	// Write the new content
	err = ioutil.WriteFile(absPath, []byte(newFileContent), 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to write new file content: %w", err)
	}

	// Count the new lines
	newLines := strings.Count(promptVer.Content, "\n") + 1
	linesChanged := newLines - oldLines

	// Send the integration request to the server
	data, err := json.Marshal(IntegrationRequest{FilePath: filePath})
	if err != nil {
		return nil, err
	}

	resp, err := c.sendRequest("POST", fmt.Sprintf("/api/prompts/%s/versions/%s/integrate", promptID, version), bytes.NewBuffer(data))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result models.IntegrationResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	// Override with our actual results
	result.Success = true
	result.FilePath = absPath
	result.BackupPath = backupPath
	result.LinesChanged = linesChanged

	return &result, nil
}

// sendRequest sends an HTTP request to the prompt server
func (c *Client) sendRequest(method, path string, body *bytes.Buffer) (*http.Response, error) {
	url := c.BaseURL + path
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if c.AuthToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.AuthToken))
	}

	return c.HTTPClient.Do(req)
}
