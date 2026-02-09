-- Complete cleanup: Remove admin and moderator roles from database
-- Fixed version to handle RLS policies on profiles, events, AND storage

-- Step 1: Update any existing admin/moderator users to member role
UPDATE public.profiles 
SET role = 'member' 
WHERE role IN ('admin', 'moderator');

-- Step 2: Drop ALL RLS policies that depend on the role column (including storage)
-- Drop storage policies first
DROP POLICY IF EXISTS "Avatar Upload Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Access Policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;

-- Drop any storage policies that might reference profiles.role
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- Drop events and profiles policies
DROP POLICY IF EXISTS "Admins/Copil Manage All Events" ON public.events;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND (tablename = 'profiles' OR tablename = 'events')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Drop the default constraint temporarily
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Step 4: Create new enum without admin/moderator
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
        CREATE TYPE public.user_role_new AS ENUM ('member', 'referent', 'copil', 'copil_plus');
    END IF;
END $$;

-- Step 5: Update the column to use the new type
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE user_role_new 
  USING role::text::user_role_new;

-- Step 6: Drop the old type
DROP TYPE IF EXISTS public.user_role;

-- Step 7: Rename the new type to the original name
ALTER TYPE public.user_role_new RENAME TO user_role;

-- Step 8: Re-add the default constraint with the new type
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Step 9: Recreate RLS policies without admin/moderator references
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Events policies (updated to remove admin)
CREATE POLICY "Everyone can view events" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Copil can manage all events" 
ON public.events FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('copil', 'copil_plus')
    )
);

CREATE POLICY "Referents can manage regional events" 
ON public.events FOR ALL 
USING (
    scope = 'regional' AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'referent'
        AND region = events.region
    )
);

-- Storage policies (avatars - updated to remove admin/moderator)
CREATE POLICY "Avatar Upload Policy" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = 'avatars' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('copil', 'copil_plus', 'referent')
    )
);

CREATE POLICY "Public Avatar Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Avatar Update Policy" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('copil', 'copil_plus', 'referent')
    )
);

CREATE POLICY "Avatar Delete Policy" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' AND
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('copil', 'copil_plus', 'referent')
    )
);

-- Step 10: Verify the change
SELECT DISTINCT role FROM public.profiles;
