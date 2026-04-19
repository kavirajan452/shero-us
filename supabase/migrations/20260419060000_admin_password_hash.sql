-- Give admin_accounts its own password_hash column so admin login
-- can be verified with a direct Postgres connection (no Supabase Auth needed).

ALTER TABLE public.admin_accounts
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Copy the bcrypt hash that Supabase Auth already stores in auth.users.
-- auth.users.encrypted_password is a standard bcrypt hash (pgcrypto / $2a$).
-- Node's bcryptjs can verify against it directly.
UPDATE public.admin_accounts aa
SET    password_hash = u.encrypted_password
FROM   auth.users u
WHERE  u.id = aa.auth_user_id
  AND  aa.password_hash IS NULL;
