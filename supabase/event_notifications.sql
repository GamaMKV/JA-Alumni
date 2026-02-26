-- Migration pour le système d'alertes automatisées

-- 1. Ajout des colonnes de configuration des rappels à la table 'events'
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS reminder_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS reminder_content TEXT,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- 2. Création de la table 'notifications'
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('popup', 'dashboard', 'email', 'all')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System/Admins can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('copil', 'copil_plus', 'referent')
        )
        OR auth.role() = 'service_role'
    );

-- 3. Fonction pour générer les notifications automatiquement
-- Cette fonction peut être appelée par un cron job (Edge Function ou pg_cron)
CREATE OR REPLACE FUNCTION public.check_and_generate_reminders()
RETURNS void AS $$
DECLARE
    evt RECORD;
    participant RECORD;
BEGIN
    -- On boucle sur les événements qui ont un rappel configuré, non envoyé, et dont la date approche
    FOR evt IN 
        SELECT * FROM public.events 
        WHERE reminder_sent = FALSE 
        AND reminder_content IS NOT NULL
        AND reminder_content <> ''
        AND (date_start - (reminder_days || ' days')::INTERVAL) <= NOW()
    LOOP
        -- Pour chaque événement trouvé, on cherche les participants
        FOR participant IN 
            SELECT user_id FROM public.participations WHERE event_id = evt.id
        LOOP
            -- On génère la notification pour chaque participant
            INSERT INTO public.notifications (user_id, event_id, type, title, content)
            VALUES (
                participant.user_id, 
                evt.id, 
                'all', 
                'Rappel : ' || evt.title, 
                evt.reminder_content
            );
        END LOOP;

        -- On marque l'événement comme ayant envoyé son rappel
        UPDATE public.events SET reminder_sent = TRUE WHERE id = evt.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
