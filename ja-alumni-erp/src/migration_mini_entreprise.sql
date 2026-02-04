-- Migration: Add Mini-Entreprise fields to profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mini_entreprise_annee INTEGER;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mini_entreprise_ecole TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mini_entreprise_nom TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mini_entreprise_organisation TEXT;

-- Optional: Add check constraint for organisation if strictly limited
-- ALTER TABLE public.profiles ADD CONSTRAINT check_organisation 
-- CHECK (mini_entreprise_organisation IN ('EPA', '1000_ENT'));
