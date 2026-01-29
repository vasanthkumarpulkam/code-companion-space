-- Ensure job-media bucket is private and public policies are removed
UPDATE storage.buckets SET public = false WHERE id = 'job-media';

DROP POLICY IF EXISTS "Job media is publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view job media" ON storage.objects;
