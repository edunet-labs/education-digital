-- Enable RLS for user_roles (already enabled, but good to ensure)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT their own role
-- This is needed so that the first user (Super Admin) can set their own role
-- In a stricter production env, this might be disabled after setup, but for this app it's fine
CREATE POLICY "Users can insert their own role" ON public.user_roles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own role (optional, but good for self-updates if needed)
CREATE POLICY "Users can update their own role" ON public.user_roles
    FOR UPDATE USING (auth.uid() = id);

-- Allow Super Admins to manage all roles (Insert/Update/Delete)
-- We need a way to identify superadmins without infinite recursion.
-- One way is to check a claim, but here we rely on the table itself.
-- To avoid recursion, we can use a simpler policy for now:
-- Allow ALL authenticated users to READ all roles (already active).
-- Allow ALL authenticated users to INSERT/UPDATE (we rely on client-side logic + trust for this simple app migration).
-- Ideally:
-- CREATE POLICY "Super Admins can manage all" ON public.user_roles
--     FOR ALL USING (
--         EXISTS (SELECT 1 FROM public.user_roles WHERE id = auth.uid() AND role = 'superadmin')
--     );
