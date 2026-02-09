-- Performance Optimization: Add database indexes for faster queries

-- Index on role column (frequently filtered in directory, calendar, etc.)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Index on region column (filtered in directory and regional views)
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);

-- Partial index for Copil members (smaller, faster for Copil-specific queries)
CREATE INDEX IF NOT EXISTS idx_profiles_copil_role 
ON public.profiles(copil_role) 
WHERE role IN ('copil', 'copil_plus');

-- Index for events date range queries
CREATE INDEX IF NOT EXISTS idx_events_date_start ON public.events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_date_end ON public.events(date_end);

-- Composite index for event scope and region filtering
CREATE INDEX IF NOT EXISTS idx_events_scope_region 
ON public.events(scope, region);

-- Index for profile lookups by email (debug mode, authentication)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'events')
ORDER BY tablename, indexname;
