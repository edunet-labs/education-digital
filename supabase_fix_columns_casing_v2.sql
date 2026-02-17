-- ==========================================
-- SCRIPT STANDARISASI KOLOM (REVISI)
-- Masalah: Error "column pdfUrl does not exist".
-- Penyebab: Kolom pdfUrl (CamelCase) ternyata tidak ada, yang ada pdfurl (lowercase).
--          Yang dobel hanya "jobsheetUrl".
-- ==========================================

-- 1. Pastikan semua kolom lowercase ada
ALTER TABLE public.materi ADD COLUMN IF NOT EXISTS jobsheeturl TEXT;
ALTER TABLE public.materi ADD COLUMN IF NOT EXISTS pdfurl TEXT;
ALTER TABLE public.materi ADD COLUMN IF NOT EXISTS videourl TEXT;

-- 2. Pindahkan data dari CamelCase ke lowercase KHUSUS untuk jobsheetUrl
--    (Karena di daftar tabelmu, cuma jobsheetUrl yang punya kembaran CamelCase)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'materi' AND column_name = 'jobsheetUrl') THEN
    UPDATE public.materi
    SET jobsheeturl = COALESCE(jobsheeturl, "jobsheetUrl");
  END IF;
END $$;

-- 3. Hapus kolom CamelCase (Penyebab Ambigu) jika ada
ALTER TABLE public.materi DROP COLUMN IF EXISTS "jobsheetUrl";
ALTER TABLE public.materi DROP COLUMN IF EXISTS "pdfUrl";
ALTER TABLE public.materi DROP COLUMN IF EXISTS "videoUrl";

-- 4. Notify Reload Schema
NOTIFY pgrst, 'reload schema';

-- 5. Cek hasil akhir (semua harusnya lowercase)
SELECT column_name FROM information_schema.columns WHERE table_name = 'materi';
