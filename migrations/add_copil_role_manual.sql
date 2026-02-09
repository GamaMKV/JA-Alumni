-- Migration script to add copil_role column
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS copil_role TEXT;
