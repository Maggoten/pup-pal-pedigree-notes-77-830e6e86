-- Create storage policies for puppy-images bucket
CREATE POLICY "Users can view puppy images for their own puppies"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'puppy-images' 
  AND EXISTS (
    SELECT 1
    FROM puppies p
    JOIN litters l ON p.litter_id = l.id
    WHERE l.user_id = auth.uid()
    AND storage.foldername(name)[1] = auth.uid()::text
  )
);

CREATE POLICY "Users can upload puppy images for their own puppies"
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'puppy-images' 
  AND auth.uid()::text = storage.foldername(name)[1]
);

CREATE POLICY "Users can update puppy images for their own puppies"
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'puppy-images' 
  AND auth.uid()::text = storage.foldername(name)[1]
);

CREATE POLICY "Users can delete puppy images for their own puppies"
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'puppy-images' 
  AND auth.uid()::text = storage.foldername(name)[1]
);