-- Create ENUMs for restricted values
CREATE TYPE user_role AS ENUM ('admin', 'moderateur', 'membre');
CREATE TYPE region_france AS ENUM (
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 
  'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 
  'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d''Azur',
  'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'
);

-- PROFILES Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  region region_france,
  departement TEXT,
  age INTEGER,
  situation TEXT,
  secteur TEXT,
  anniversaire DATE,
  mini_entreprise_annee INTEGER,
  mini_entreprise_ecole TEXT,
  mini_entreprise_nom TEXT,
  mini_entreprise_organisation TEXT,
  date_entree_ja DATE,
  date_dernier_event TIMESTAMP WITH TIME ZONE,
  statut user_role DEFAULT 'membre',
  consentement_rgpd BOOLEAN DEFAULT FALSE,
  derniere_maj_rgpd TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENEMENTS Table
CREATE TABLE public.evenements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  lieu TEXT,
  region_id region_france, -- Can be null for National events
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PARTICIPATIONS Table
CREATE TABLE public.participations (
  profile_id UUID REFERENCES public.profiles(id),
  event_id UUID REFERENCES public.evenements(id),
  present BOOLEAN DEFAULT FALSE,
  inscrit_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (profile_id, event_id)
);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participations ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles:
-- Admin: can select, insert, update, delete ALL
-- Moderator: can select ALL, update users in their region
-- Member: can select and update ONLY their own profile

CREATE POLICY "Admin can do everything on profiles" ON public.profiles
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'admin'));

CREATE POLICY "Moderators can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'moderateur'));

CREATE POLICY "Moderators can update profiles in their region" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut = 'moderateur') AND
    region = (SELECT region FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Members can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Events:
-- All authenticated users can view events
-- Admins and Moderators can create/update events

CREATE POLICY "Everyone can view events" ON public.evenements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and Mods can manage events" ON public.evenements
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut IN ('admin', 'moderateur'))
  );

-- Participations:
-- Members can insert (register) for events
-- Admins/Mods can update (mark present)

CREATE POLICY "Members can register themselves" ON public.participations
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Members can view their participations" ON public.participations
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Admins and Mods can manage participations" ON public.participations
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE statut IN ('admin', 'moderateur'))
  );

-- TRIGGER to handle new user signup
-- (Assumes Supabase Auth is used. We need a trigger to create a profile entry on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, statut)
  VALUES (new.id, new.email, 'membre');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
