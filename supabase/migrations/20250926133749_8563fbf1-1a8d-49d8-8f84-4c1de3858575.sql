-- Create storage policies for documents bucket
CREATE POLICY "Allow authenticated users to upload documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to view documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to update documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to delete documents" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'documents');