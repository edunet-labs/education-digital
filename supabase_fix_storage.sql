-- ==========================================
-- SCRIPT FIX STORAGE BUCKET & POLICIES
-- Jalankan ini untuk memperbaiki error "Failed to fetch" saat upload
-- ==========================================

-- 1. Buat Bucket 'materi' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('materi', 'materi', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Reset Policy Storage (Hapus yang lama biar bersih)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Give me liberty or give me death" ON storage.objects;
DROP POLICY IF EXISTS "Allow All to materials" ON storage.objects;
DROP POLICY IF EXISTS "Allow All to materi" ON storage.objects;

-- 3. Buat Policy BARU yang membolehkan SEMUANYA (Upload, View, Delete)
--    Supaya tidak ada error permission lagi.
CREATE POLICY "Allow All to materi"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'materi')
WITH CHECK (bucket_id = 'materi');

-- Selesai! Coba upload lagi.
