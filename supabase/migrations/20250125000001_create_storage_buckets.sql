-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('documents', 'documents', true),
('result-photos', 'result-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Documents are publicly accessible" ON storage.objects 
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Admins can upload documents" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Admins can remove documents" ON storage.objects 
FOR DELETE USING (bucket_id = 'documents');

-- Storage policies for result-photos bucket
CREATE POLICY "Result photos are publicly accessible" ON storage.objects 
FOR SELECT USING (bucket_id = 'result-photos');

CREATE POLICY "Admins can upload result photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'result-photos');

CREATE POLICY "Admins can remove result photos" ON storage.objects 
FOR DELETE USING (bucket_id = 'result-photos');
