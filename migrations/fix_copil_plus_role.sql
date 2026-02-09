-- Ensure copil_plus exists in the role enum
-- Assuming the enum type is named 'user_role' or 'app_role' or handled by a check constraint.
-- Try adding to common enum names. 

-- If it's a Check Constraint on the column:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('member', 'admin', 'moderator', 'referent', 'copil', 'copil_plus'));

-- If it's a Postgres ENUM type (uncomment if you use types):
-- ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'copil_plus';
