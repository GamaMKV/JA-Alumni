-- 1. Update ENUM (Trick: We cannot ALTER ENUM inside a transaction block easily in some Postgres versions, 
-- but Supabase allows 'ALTER TYPE ... ADD VALUE')

-- Note: You might need to run these lines one by one if the editor complains.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'copil';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'copil_plus';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'referent';

-- 2. Add Columns to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS poste TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pole TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Create Storage Bucket for Avatars
-- Note: This usually requires enabling the storage extension if not present, but standard on Supabase.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies (RLS)
-- Allow public read access
CREATE POLICY "Avatar Public Access" ON storage.objects
  FOR SELECT USING ( bucket_id = 'avatars' );

-- Allow authenticated users with specific roles to upload their OWN avatar
-- Roles: admin, moderateur, copil, copil_plus, referent
CREATE POLICY "Privileged users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND statut IN ('admin', 'moderateur', 'copil', 'copil_plus', 'referent')
    )
  );

CREATE POLICY "Privileged users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND statut IN ('admin', 'moderateur', 'copil', 'copil_plus', 'referent')
    )
  );

CREATE POLICY "Privileged users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND statut IN ('admin', 'moderateur', 'copil', 'copil_plus', 'referent')
    )
  );
