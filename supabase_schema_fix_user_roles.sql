-- Fix missing columns in user_roles table
-- The application tries to save updated_at, username, and name, but they don't exist in the table.

ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;
