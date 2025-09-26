-- Fix Row Level Security policies for local development

-- Disable RLS temporarily for local development
ALTER TABLE public.schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;

-- Alternative: Create permissive policies if you want to keep RLS enabled
-- Uncomment these if you prefer to keep RLS enabled:

-- CREATE POLICY "Allow all operations on schedule" ON public.schedule
-- FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on results" ON public.results
-- FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on gallery" ON public.gallery
-- FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow all operations on announcements" ON public.announcements
-- FOR ALL USING (true) WITH CHECK (true);
