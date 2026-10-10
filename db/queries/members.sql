-- name: CreateMember :one
INSERT INTO members (uid, email, verified, first_name, last_name, created_at)
VALUES (?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: GetMemberByID :one
SELECT * FROM members WHERE id = ?;

-- name: GetMemberByUID :one
SELECT * FROM members WHERE uid = ?;

-- name: GetMemberByEmail :one
SELECT * FROM members WHERE email = ?;

-- name: SetMemberVerified :one
UPDATE members SET verified = 1, updated_at = ? WHERE id = ? RETURNING *;

-- name: ListMembers :many
SELECT * FROM members
WHERE CAST(@search AS TEXT) = ''
  OR instr(lower(email), lower(CAST(@search AS TEXT))) > 0
  OR instr(lower(first_name), lower(CAST(@search AS TEXT))) > 0
  OR instr(lower(last_name), lower(CAST(@search AS TEXT))) > 0
ORDER BY email ASC
LIMIT @limit OFFSET @offset;

-- name: CountMembers :one
SELECT COUNT(*) FROM members
WHERE CAST(@search AS TEXT) = ''
  OR instr(lower(email), lower(CAST(@search AS TEXT))) > 0
  OR instr(lower(first_name), lower(CAST(@search AS TEXT))) > 0
  OR instr(lower(last_name), lower(CAST(@search AS TEXT))) > 0;

-- name: UpdateMember :one
UPDATE members
SET email = ?, first_name = ?, last_name = ?, updated_at = ?
WHERE id = ?
RETURNING *;

-- name: DeleteMember :exec
DELETE FROM members WHERE id = ?;
