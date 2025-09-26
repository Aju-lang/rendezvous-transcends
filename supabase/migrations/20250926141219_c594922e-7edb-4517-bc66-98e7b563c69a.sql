-- Fix all admin dashboard upload errors

-- 1. Add missing created_at column to gallery table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'created_at') THEN
        ALTER TABLE public.gallery ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- 2. Create result-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('result-photos', 'result-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Add storage policies for result-photos bucket
CREATE POLICY "Allow authenticated users to upload result photos" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'result-photos');

CREATE POLICY "Allow authenticated users to view result photos" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'result-photos');

CREATE POLICY "Allow authenticated users to update result photos" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'result-photos')
WITH CHECK (bucket_id = 'result-photos');

CREATE POLICY "Allow authenticated users to delete result photos" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'result-photos');

-- 4. Add storage policies for gallery bucket
CREATE POLICY "Allow authenticated users to upload gallery images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to view gallery images" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to update gallery images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to delete gallery images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'gallery');

-- 5. Add RLS policies for buckets table (to allow bucket creation)
CREATE POLICY "Allow authenticated users to create buckets" 
ON storage.buckets 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to view buckets" 
ON storage.buckets 
FOR SELECT 
TO authenticated
USING (true);

-- 6. Add triggers for updated_at columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gallery_updated_at') THEN
        CREATE TRIGGER update_gallery_updated_at
        BEFORE UPDATE ON public.gallery
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;