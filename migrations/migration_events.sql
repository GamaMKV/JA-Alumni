-- MIGRATION: EVENTS & CALENDAR
-- Updates 'events' table with region/scope and sets RLS for Ref/Copil.

BEGIN;

-- 1. Add Columns to Events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'regional', -- 'national', 'regional'
ADD COLUMN IF NOT EXISTS region TEXT; -- targeted region

-- 2. Drop existing event policies
DROP POLICY IF EXISTS "Public Read Events" ON public.events;
DROP POLICY IF EXISTS "Admins/Mods Manage Events" ON public.events;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. RLS: READ (Everyone authenticated)
CREATE POLICY "Auth Read Events" ON public.events 
FOR SELECT 
TO authenticated 
USING (true);

-- 4. RLS: INSERT/UPDATE/DELETE (Role-based)

-- ADMIN / COPIL: Full control over all events
CREATE POLICY "Admins/Copil Manage All Events" ON public.events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'copil')
    )
);

-- REFERENT: Manage only their OWN region's events
-- Must match their profile region.
CREATE POLICY "Referent Manage Regional Events" ON public.events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'referent' 
        AND region = events.region
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'referent' 
        AND region = events.region
    )
);

COMMIT;
