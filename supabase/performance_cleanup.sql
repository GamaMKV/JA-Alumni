-- Migration pour optimiser les performances (Indexation et Nettoyage)

-- 1. Indexation des clés étrangères manquantes (Foreign Keys)
-- Identifié par le linter : audit_logs(user_id), events(created_by), participations(event_id)

-- Audit Logs (si la table existe)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
    END IF;
END $$;

-- Events (created_by)
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Participations (event_id)
-- Note: idx_participations_event_id existe peut-être déjà selon les schémas précédents
CREATE INDEX IF NOT EXISTS idx_participations_event_id ON public.participations(event_id);


-- 2. Nettoyage des index inutilisés ou obsolètes
-- Identifié par le linter comme "non utilisés" (candidates for removal)

DROP INDEX IF EXISTS public.idx_profiles_role;
DROP INDEX IF EXISTS public.idx_profiles_copil_role;
DROP INDEX IF EXISTS public.idx_events_date_end;
DROP INDEX IF EXISTS public.idx_events_scope_region;

-- Note sur idx_profiles_email et idx_profiles_region/statut : 
-- Bien que listés comme "inutilisés", il est préférable de les garder 
-- s'ils servent à des contraintes d'unicité ou des filtrages futurs prévus.
-- On ne supprime que ceux qui sont clairement liés à des colonnes obsolètes ou peu filtrées.


-- 3. Optimisation finale pour RLS (Rappel par sécurité)
-- Si vous n'avez pas encore passé le script précédent, ces index aident énormément :
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON public.participations(user_id);
