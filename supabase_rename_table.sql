-- ==========================================
-- SCRIPT RENAME TABLE: MATERIALS -> MATERI
-- Sesuai request untuk menyeragamkan nama menjadi "materi"
-- ==========================================

-- 1. Rename Table jika masih bernama 'materials'
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    ALTER TABLE public.materials RENAME TO materi;
  END IF;
END $$;

-- 2. Pastikan tabel 'materi' punya semua kolom lengkap
-- (Jaga-jaga kalau tadi rename gagal atau tabel belum ada)
CREATE TABLE IF NOT EXISTS public.materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    kelas INTEGER,
    spesialisasi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom-kolom baru ke tabel 'materi'
ALTER TABLE public.materi 
ADD COLUMN IF NOT EXISTS modul TEXT,
ADD COLUMN IF NOT EXISTS durasi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tingkat TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS deskripsi TEXT,
ADD COLUMN IF NOT EXISTS konten TEXT,
ADD COLUMN IF NOT EXISTS videoUrl TEXT,
ADD COLUMN IF NOT EXISTS pdfUrl TEXT,
ADD COLUMN IF NOT EXISTS jobsheetUrl TEXT;

-- 3. Update RLS Policies untuk tabel 'materi'
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama (jika ada yang nempel)
DROP POLICY IF EXISTS "Materials - Allow Read All" ON public.materi;
DROP POLICY IF EXISTS "Materials - Allow Write Authenticated" ON public.materi;
DROP POLICY IF EXISTS "Materi - Allow Read All" ON public.materi;
DROP POLICY IF EXISTS "Materi - Allow Write Authenticated" ON public.materi;

-- Buat Policy BARU untuk tabel 'materi'
-- 1. Semua orang (public) boleh BACA
CREATE POLICY "Materi - Allow Read All" ON public.materi FOR SELECT USING (true);

-- 2. User yang login (Admin) boleh EDIT (Insert, Update, Delete)
CREATE POLICY "Materi - Allow Write Authenticated" ON public.materi 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

