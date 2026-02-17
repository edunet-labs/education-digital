-- Add missing columns to materials table to match Firebase structure
-- We use TEXT for flexible storage, and specific types where appropriate.

ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS modul TEXT,
ADD COLUMN IF NOT EXISTS durasi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tingkat TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS deskripsi TEXT, -- Mapping 'deskripsi' from app
ADD COLUMN IF NOT EXISTS konten TEXT,
ADD COLUMN IF NOT EXISTS videoUrl TEXT, -- Keeping camelCase to match app usage if preferred, or use video_url
ADD COLUMN IF NOT EXISTS pdfUrl TEXT,
ADD COLUMN IF NOT EXISTS jobsheetUrl TEXT;

-- Note: 'description' and 'file_url' were in original schema but app uses 'deskripsi', 'pdfUrl', 'jobsheetUrl'.
-- We keep them for now or ignore them. The app seems to send 'deskripsi'.

-- Update RLS if needed (existing policies cover 'all columns', so usually fine)
