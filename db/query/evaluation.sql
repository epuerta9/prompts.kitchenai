-- name: CreateEvaluation :one
INSERT INTO evaluations (
  id, prompt_version_id, score, notes, created_by
) VALUES (
  ?, ?, ?, ?, ?
)
RETURNING *;

-- name: GetEvaluation :one
SELECT * FROM evaluations
WHERE id = ? LIMIT 1;

-- name: ListEvaluations :many
SELECT * FROM evaluations
WHERE prompt_version_id = ?
ORDER BY created_at DESC;

-- name: DeleteEvaluation :exec
DELETE FROM evaluations
WHERE id = ?;

-- name: DeleteEvaluationsByVersion :exec
DELETE FROM evaluations
WHERE prompt_version_id = ?; 