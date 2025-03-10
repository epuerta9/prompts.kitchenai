-- name: CreateVersion :one
INSERT INTO prompt_versions (
  id, prompt_id, version, content, created_by
) VALUES (
  ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetVersion :one
SELECT * FROM prompt_versions
WHERE id = ? LIMIT 1;

-- name: GetVersionByPromptAndNumber :one
SELECT * FROM prompt_versions
WHERE prompt_id = ? AND version = ? LIMIT 1;

-- name: ListVersions :many
SELECT * FROM prompt_versions
WHERE prompt_id = ?
ORDER BY version DESC;

-- name: GetLatestVersionNumber :one
SELECT COALESCE(MAX(version), 0) as latest_version
FROM prompt_versions
WHERE prompt_id = ?;

-- name: DeleteVersions :exec
DELETE FROM prompt_versions
WHERE prompt_id = ?; 