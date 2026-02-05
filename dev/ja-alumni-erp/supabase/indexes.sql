-- INDEXES to improve performance of RLS and common queries

-- 1. Profiles: Vital for RLS policies helping Admins/Moderators find users quickly
CREATE INDEX IF NOT EXISTS idx_profiles_statut ON public.profiles(statut);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);

-- Profiles: Needed for "Promo" filtering (e.g. "Find all 2024 Alumni")
CREATE INDEX IF NOT EXISTS idx_profiles_mini_annee ON public.profiles(mini_entreprise_annee);

-- Profiles: Search optimization (Trombinoscope)
-- Allows fast case-insensitive search on names
CREATE INDEX IF NOT EXISTS idx_profiles_search_names ON public.profiles USING gin ((nom || ' ' || prenom) gin_trgm_ops);
-- Note: 'gin_trgm_ops' requires pg_trgm extension. If not available, use simple btree:
-- CREATE INDEX IF NOT EXISTS idx_profiles_nom ON public.profiles(nom);
-- CREATE INDEX IF NOT EXISTS idx_profiles_prenom ON public.profiles(prenom);

-- 2. Events: Filtering by date and region (Calendar widgets)
CREATE INDEX IF NOT EXISTS idx_events_date ON public.evenements(date);
CREATE INDEX IF NOT EXISTS idx_events_region ON public.evenements(region_id);

-- 3. Participations: KPI calculations (Counting attendees)
CREATE INDEX IF NOT EXISTS idx_participations_event_id ON public.participations(event_id);
CREATE INDEX IF NOT EXISTS idx_participations_profile_id ON public.participations(profile_id);
