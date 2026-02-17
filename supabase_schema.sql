-- Create materials table
CREATE TABLE public.materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    kelas INTEGER NOT NULL, -- 10, 11, 12
    spesialisasi TEXT, -- AIJ, ASJ, KJ, etc
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Enable read access for all users" ON public.materials
    FOR SELECT USING (true);

-- Create policy to allow insert/update/delete for authenticated users only (Admins)
-- Note: In a real app, you'd want to check for specific roles.
-- For now, we'll allow any authenticated user to modify.
CREATE POLICY "Enable insert for authenticated users only" ON public.materials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.materials
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.materials
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create user_roles table to manage roles
CREATE TABLE public.user_roles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'superadmin')),
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = id);

-- Allow superadmins to read all roles
-- (This requires a recursive check or a separate function to avoid infinite recursion, 
--  simplifying for now: we will just use a secure function or trust auth.uid for simple apps)
-- For simplicity in this migration, allow authenticated read for now, tighten later.
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Storage Bucket Setup (You must create the bucket 'materials' in the dashboard first)
-- This SQL just sets policies for it assuming it exists.

-- Policy for storage 'materials'
-- Allow public read
-- CREATE POLICY "Give public access to materials" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
-- Allow authenticated upload
-- CREATE POLICY "Enable upload for authenticated users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials' AND auth.role() = 'authenticated');
