-- Fix for strict Enum type "user_role"
-- This must be run to allow "copil_plus" as a valid enum value.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'copil_plus';

-- If you want to clean up checks as well (just in case)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
