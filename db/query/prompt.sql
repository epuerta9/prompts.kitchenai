-- name: CreatePrompt :one
INSERT INTO prompts (
  id, title, description, created_by
) VALUES (
  ?, ?, ?, ?
)
RETURNING *;

-- name: GetPrompt :one
SELECT * FROM prompts
WHERE id = ? LIMIT 1;

-- name: ListPrompts :many
SELECT * FROM prompts
ORDER BY created_at DESC;

-- name: ListPromptsByUser :many
SELECT * FROM prompts
WHERE created_by = ?
ORDER BY created_at DESC;

-- name: UpdatePrompt :one
UPDATE prompts
SET 
  title = ?,
  description = ?,
  updated_at = CURRENT_TIMESTAMP
WHERE id = ?
RETURNING *;

-- name: DeletePrompt :exec
DELETE FROM prompts
WHERE id = ?; 