-- 1. Function to process account deletions
-- This function should be run daily via a cron job
CREATE OR REPLACE FUNCTION public.process_account_deletions()
RETURNS void AS $$
BEGIN
  -- Delete profiles scheduled for deletion where the date has passed
  -- Note: Depending on foreign key constraints (CASCADE), this might also delete related data (participations, events).
  -- If you want to delete the AUTH USER as well, this function needs to be called by a service role or have special permissions,
  -- as PL/PGSQL functions cannot directly delete from auth.users easily without elevated privileges.
  -- Here we assume we just soft-delete or anonymize the profile, or that a separate trigger handles auth.users.
  
  DELETE FROM public.profiles
  WHERE deletion_scheduled_at IS NOT NULL
    AND deletion_scheduled_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Function to reset RGPD consent after 2 years
-- This function should be run daily via a cron job
CREATE OR REPLACE FUNCTION public.reset_expired_rgpd_consent()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    consentement_rgpd = FALSE,
    updated_at = NOW()
  WHERE 
    consentement_rgpd = TRUE
    AND derniere_maj_rgpd < (NOW() - INTERVAL '2 years');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Function to identify inactive users (2 years)
-- This allows you to select users who haven't updated their profile in 2 years to send them an email.
-- You would call this from your backend code (e.g. Next.js API route / cron) to get the list of emails.
CREATE OR REPLACE FUNCTION public.get_inactive_users_for_email()
RETURNS TABLE (email text) AS $$
BEGIN
  RETURN QUERY
  SELECT p.email
  FROM public.profiles p
  WHERE 
    p.updated_at < (NOW() - INTERVAL '2 years')
    -- Add a check to avoid sending emails every day?
    -- ideally you'd have a 'last_inactivity_email_sent_at' column to debounce.
    ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
