-- name: CreateComment :one
INSERT INTO comments (
  id, prompt_id, content, created_by
) VALUES (
  ?, ?, ?, ?
)
RETURNING *;

-- name: GetComment :one
SELECT * FROM comments
WHERE id = ? LIMIT 1;

-- name: ListComments :many
SELECT * FROM comments
WHERE prompt_id = ?
ORDER BY created_at DESC;

-- name: DeleteComment :exec
DELETE FROM comments
WHERE id = ?;

-- name: DeleteCommentsByPrompt :exec
DELETE FROM comments
WHERE prompt_id = ?; 