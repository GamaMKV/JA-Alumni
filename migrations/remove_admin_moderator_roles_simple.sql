-- Simplified approach: Clean up admin/moderator without modifying the enum type
-- This avoids permission issues with storage.objects policies

-- Step 1: Update any existing admin/moderator users to member role
UPDATE public.profiles 
SET role = 'member' 
WHERE role IN ('admin', 'moderator');

-- Step 2: Add a CHECK constraint to prevent future admin/moderator assignments
-- First drop any existing constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_valid_check;

-- Add new constraint that only allows the 4 valid roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_valid_check 
CHECK (role::text IN ('member', 'referent', 'copil', 'copil_plus'));

-- Step 3: Verify the change
SELECT DISTINCT role FROM public.profiles;

-- Note: The underlying enum still contains 'admin' and 'moderator' values,
-- but the CHECK constraint prevents them from being used.
-- This is acceptable since we cannot modify storage.objects policies without special permissions.
