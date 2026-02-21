-- Add missing columns for Essay PDF and Quiz Data
-- Run this in Supabase SQL Editor

-- Use 'materi' instead of 'materials' based on the application code
ALTER TABLE public.materi 
ADD COLUMN IF NOT EXISTS essay_pdf_url TEXT,
ADD COLUMN IF NOT EXISTS quiz_data JSONB;

-- Optional: If you want to index for faster searches (though not strictly necessary for this scale)
-- CREATE INDEX IF NOT EXISTS idx_materi_essay ON public.materi(essay_pdf_url);
