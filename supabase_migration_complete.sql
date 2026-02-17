-- ==========================================
-- SCRIPT FINAL MIGRASI EDUNET (ALL-IN-ONE)
-- Jalankan script ini untuk memperbaiki semua masalah permission dan kolom hilang.
-- ==========================================

-- 1. PERBAIKI TABEL USER_ROLES (Kolom Hilang)
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;

-- 2. PERBAIKI TABEL MATERIALS (Kolom Hilang)
ALTER TABLE public.materials 
ADD COLUMN IF NOT EXISTS modul TEXT,
ADD COLUMN IF NOT EXISTS durasi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tingkat TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS deskripsi TEXT,
ADD COLUMN IF NOT EXISTS konten TEXT,
ADD COLUMN IF NOT EXISTS videoUrl TEXT,
ADD COLUMN IF NOT EXISTS pdfUrl TEXT,
ADD COLUMN IF NOT EXISTS jobsheetUrl TEXT;

-- ==========================================
-- 3. RESET PERMISSION (RLS) - "NUCLEAR OPTION"
-- Kita hapus semua aturan lama dan buat aturan baru yang membolehkan Admin bekerja.
-- ==========================================

-- Reset User Roles Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Migration Policy - Allow All" ON public.user_roles;

-- Buat permission BARU: User yang login boleh melakukan APAPUN di tabel roles
-- (Penting untuk setup awal Super Admin)
CREATE POLICY "Migration Policy - Allow All" ON public.user_roles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- Reset Materials Policies
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.materials;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.materials;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.materials;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.materials;
DROP POLICY IF EXISTS "Materials - Allow Read All" ON public.materials;
DROP POLICY IF EXISTS "Materials - Allow Write Authenticated" ON public.materials;

-- Buat permission BARU:
-- 1. Semua orang (public) boleh BACA materi
CREATE POLICY "Materials - Allow Read All" ON public.materials FOR SELECT USING (true);
-- 2. User yang login (Admin) boleh EDIT materi
CREATE POLICY "Materials - Allow Write Authenticated" ON public.materials 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);
