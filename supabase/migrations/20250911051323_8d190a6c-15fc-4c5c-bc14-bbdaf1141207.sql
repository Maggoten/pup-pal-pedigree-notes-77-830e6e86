-- Create storage policies for puppy-images bucket with correct syntax
CREATE POLICY "Users can view puppy images for their own puppies"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'puppy-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload puppy images for their own puppies"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'puppy-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update puppy images for their own puppies"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'puppy-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete puppy images for their own puppies"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'puppy-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);