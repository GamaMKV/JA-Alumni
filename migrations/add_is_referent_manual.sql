-- Migration to add is_referent column
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_referent BOOLEAN DEFAULT false;
