-- Add copil_role to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS copil_role TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'copil_role';
