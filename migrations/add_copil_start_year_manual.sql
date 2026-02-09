-- Migration to add copil_start_year column
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS copil_start_year TEXT;
