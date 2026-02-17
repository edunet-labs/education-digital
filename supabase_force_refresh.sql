-- ==========================================
-- SCRIPT FORCE REFRESH SCHEMA CACHE
-- Jalankan ini jika masih muncul error "schema cache"
-- ==========================================

-- 1. Tambah kolom dummy (memancing refresh schema)
ALTER TABLE public.materi ADD COLUMN IF NOT EXISTS force_refresh_cache text;

-- 2. Hapus kolom dummy (siapa tau tadi udah ada)
ALTER TABLE public.materi DROP COLUMN IF EXISTS force_refresh_cache;

-- 3. Notify lagi (biar makin yakin)
NOTIFY pgrst, 'reload schema';

-- 4. Cek struktur tabel (untuk memastikan kolom jobsheetUrl ada)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'materi';
