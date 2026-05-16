DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Allow public read of individual files but not listing the whole bucket
CREATE POLICY "Public can read product image files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'product-images'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR (storage.foldername(name))[1] IS NOT NULL
    )
  );