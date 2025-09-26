-- Add document upload functionality to schedule and photo uploads to results

-- Add document_url column to schedule table
ALTER TABLE public.schedule 
ADD COLUMN document_url TEXT,
ADD COLUMN document_name TEXT,
ADD COLUMN document_type TEXT;

-- Update results table to support multiple photos
ALTER TABLE public.results 
ADD COLUMN photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN photo_count INTEGER DEFAULT 0;

-- Create storage buckets for documents and result photos
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('result-photos', 'result-photos', true);

-- Storage policies for documents bucket
CREATE POLICY "Documents are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Admins can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Storage policies for result-photos bucket
CREATE POLICY "Result photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'result-photos');
CREATE POLICY "Admins can upload result photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'result-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update result photos" ON storage.objects FOR UPDATE USING (bucket_id = 'result-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete result photos" ON storage.objects FOR DELETE USING (bucket_id = 'result-photos' AND auth.uid() IS NOT NULL);

-- Update existing storage policies to allow all operations for admins
DROP POLICY IF EXISTS "Admins can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload result images" ON storage.objects;

CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update gallery images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can upload result images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'results' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update result images" ON storage.objects FOR UPDATE USING (bucket_id = 'results' AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete result images" ON storage.objects FOR DELETE USING (bucket_id = 'results' AND auth.uid() IS NOT NULL);

-- Create function to update photo count
CREATE OR REPLACE FUNCTION public.update_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    NEW.photo_count = jsonb_array_length(NEW.photos);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo count
CREATE TRIGGER update_results_photo_count 
  BEFORE INSERT OR UPDATE ON public.results 
  FOR EACH ROW EXECUTE FUNCTION public.update_photo_count();

-- Add comments for documentation
COMMENT ON COLUMN public.schedule.document_url IS 'URL to uploaded document file';
COMMENT ON COLUMN public.schedule.document_name IS 'Original name of the uploaded document';
COMMENT ON COLUMN public.schedule.document_type IS 'MIME type of the uploaded document';
COMMENT ON COLUMN public.results.photos IS 'Array of photo URLs for this result';
COMMENT ON COLUMN public.results.photo_count IS 'Number of photos associated with this result';
