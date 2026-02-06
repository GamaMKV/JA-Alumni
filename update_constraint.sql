-- Met à jour la contrainte pour accepter les formats EPA (S, M, L)

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_mini_organisation;

ALTER TABLE public.profiles 
ADD CONSTRAINT check_mini_organisation 
CHECK (
    mini_entreprise_organisation IN (
        'EPA', 
        'EPA (S)', 
        'EPA (M)', 
        'EPA (L)', 
        '1000_ENT'
    ) 
    OR mini_entreprise_organisation IS NULL
);
