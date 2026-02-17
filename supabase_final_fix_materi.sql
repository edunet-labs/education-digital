-- ==========================================
-- SCRIPT FINAL FIX TABLE: MATERI
-- Jalankan ini untuk memastikan tabel 'materi' benar-benar ada
-- ==========================================

-- 1. Buat Tabel 'materi' (jika belum ada)
CREATE TABLE IF NOT EXISTS public.materi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    kelas INTEGER,
    spesialisasi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Kolom tambahan
    modul TEXT,
    durasi INTEGER DEFAULT 0,
    tingkat TEXT,
    icon TEXT,
    deskripsi TEXT,
    konten TEXT,
    videoUrl TEXT,
    pdfUrl TEXT,
    jobsheetUrl TEXT
);

-- 2. Pindahkan data dari 'materials' ke 'materi' (jika tabel lama masih ada)
--    Kita pakai metode insert select manual
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    INSERT INTO public.materi (id, title, description, file_url, kelas, spesialisasi, created_at, updated_at, modul, durasi, tingkat, icon, deskripsi, konten, videoUrl, pdfUrl, jobsheetUrl)
    SELECT id, title, description, file_url, kelas, spesialisasi, created_at, updated_at, modul, durasi, tingkat, icon, deskripsi, konten, videoUrl, pdfUrl, jobsheetUrl
    FROM public.materials
    ON CONFLICT (id) DO NOTHING;
    
    -- Hapus tabel lama biar ga bingung
    DROP TABLE public.materials;
  END IF;
END $$;

-- 3. Reset RLS Policy (Pastikan permission benar)
ALTER TABLE public.materi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Materi - Allow Read All" ON public.materi;
DROP POLICY IF EXISTS "Materi - Allow Write Authenticated" ON public.materi;

-- Public Read
CREATE POLICY "Materi - Allow Read All" ON public.materi FOR SELECT USING (true);

-- Authenticated Write (Admin)
CREATE POLICY "Materi - Allow Write Authenticated" ON public.materi 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Notify PostgREST to reload schema cache (PENTING!)
NOTIFY pgrst, 'reload schema';
