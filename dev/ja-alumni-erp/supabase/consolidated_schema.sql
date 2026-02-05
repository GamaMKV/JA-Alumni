-- CONSOLIDATED SCHEMA (Source of Truth)
-- Run this in the Supabase SQL Editor to set up the database from scratch.

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Required for fuzzy search (Trombinoscope)

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'moderateur', 'membre');
-- 'membre' = Alumni
-- 'moderateur' = Référent Régional
-- 'admin' = COPIL / SuperAdmin

DROP TYPE IF EXISTS region_france CASCADE;
CREATE TYPE region_france AS ENUM (
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 
  'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d''Azur',
  'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'
);

-- 2. TABLES

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  region region_france,
  departement TEXT,
  age INTEGER,
  situation TEXT,
  secteur TEXT,
  anniversaire DATE,
  -- Mini Entreprise Fields
  mini_entreprise_annee INTEGER,
  mini_entreprise_ecole TEXT,
  mini_entreprise_nom TEXT,
  mini_entreprise_organisation TEXT CHECK (mini_entreprise_organisation IN ('EPA', '1000_ENT') OR mini_entreprise_organisation IS NULL),
  
  date_entree_ja DATE DEFAULT CURRENT_DATE,
  date_dernier_event TIMESTAMP WITH TIME ZONE,
  statut user_role DEFAULT 'membre',
  
  -- RGPD / Admin fields
  consentement_rgpd BOOLEAN DEFAULT FALSE,
  derniere_maj_rgpd TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deletion_scheduled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  lieu TEXT,
  region_id region_france, -- NULL = National Event
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTICIPATIONS
CREATE TABLE IF NOT EXISTS public.participations (
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.evenements(id) ON DELETE CASCADE,
  present BOOLEAN DEFAULT FALSE,
  inscrit_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (profile_id, event_id)
);

-- 3. INDEXES (Performance)
CREATE INDEX IF NOT EXISTS idx_profiles_statut ON public.profiles(statut);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_mini_annee ON public.profiles(mini_entreprise_annee);
CREATE INDEX IF NOT EXISTS idx_profiles_search_names ON public.profiles USING gin ((nom || ' ' || prenom) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.evenements(date);
CREATE INDEX IF NOT EXISTS idx_events_region ON public.evenements(region_id);

CREATE INDEX IF NOT EXISTS idx_participations_event_id ON public.participations(event_id);
CREATE INDEX IF NOT EXISTS idx_participations_profile_id ON public.participations(profile_id);

-- 4. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;

-- 4.1 Profiles Policies
CREATE POLICY "Admin (COPIL) can do everything" ON public.profiles
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'admin'));

CREATE POLICY "Moderators (Referents) can view all" ON public.profiles
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'moderateur'));

CREATE POLICY "Moderators (Referents) can update their region" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'moderateur') AND
    region = (SELECT region FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Members (Alumni) can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members (Alumni) can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4.2 Events Policies
CREATE POLICY "Everyone (Authenticated) can view events" ON public.evenements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins/Mods can manage events" ON public.evenements
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut IN ('admin', 'moderateur'))
  );

-- 4.3 Participations Policies
CREATE POLICY "Members can register themselves" ON public.participations
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Members can view their participations" ON public.participations
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins/Mods can manage participations" ON public.participations
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut IN ('admin', 'moderateur'))
  );

-- 5. TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, statut)
  VALUES (new.id, new.email, 'membre');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
