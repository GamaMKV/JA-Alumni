-- CONSTRAINTS to ensure data quality

-- 1. Ensure Mini-Entreprise Organisation is valid
-- We only accept 'EPA', '1000_ENT' or NULL (if they haven't filled it yet)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_mini_organisation 
CHECK (mini_entreprise_organisation IN ('EPA', '1000_ENT') OR mini_entreprise_organisation IS NULL);

-- 2. Ensure Email is valid format (Basic check)
ALTER TABLE public.profiles
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- 3. Ensure Events have a name
ALTER TABLE public.evenements
ALTER COLUMN nom SET NOT NULL;

-- 4. Ensure Events have a date
ALTER TABLE public.evenements
ALTER COLUMN date SET NOT NULL;
