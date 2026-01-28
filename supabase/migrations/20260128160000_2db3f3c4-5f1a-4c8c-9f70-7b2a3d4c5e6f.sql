-- Enforce chat-media file size and MIME type limits
UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/mp4'
  ]
WHERE id = 'chat-media';
