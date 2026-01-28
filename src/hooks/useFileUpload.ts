import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

function extractStoragePath(value: string, bucket: string): string | null {
  if (!value) return null;

  let path = value;
  try {
    path = new URL(value).pathname;
  } catch {
    // Not a full URL, treat as a raw path
  }

  const withoutQuery = path.split('?')[0];
  const bucketSegment = `/${bucket}/`;
  const bucketIndex = withoutQuery.indexOf(bucketSegment);

  if (bucketIndex !== -1) {
    return decodeURIComponent(withoutQuery.slice(bucketIndex + bucketSegment.length));
  }

  if (withoutQuery.startsWith(`${bucket}/`)) {
    return withoutQuery.slice(bucket.length + 1);
  }

  if (withoutQuery.startsWith('/')) {
    return withoutQuery.slice(1);
  }

  return withoutQuery;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const getFileUrl = async (
    value: string,
    bucket: 'job-media' | 'profile-images'
  ): Promise<string | null> => {
    const path = extractStoragePath(value, bucket);
    if (!path) return null;

    if (bucket === 'profile-images') {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      return publicUrl;
    }

    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    return data?.signedUrl || null;
  };

  const uploadFile = async (
    file: File,
    bucket: 'job-media' | 'profile-images',
    userId: string
  ): Promise<string | null> => {
    setUploading(true);
    setProgress(0);

    try {
      // Validate file size
      const maxSize = bucket === 'job-media' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, PNG, WEBP, and GIF images are allowed');
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      if (!data?.path) {
        throw new Error('Upload failed to return a file path');
      }

      setProgress(100);
      toast({ title: 'File uploaded successfully!' });

      if (bucket === 'profile-images') {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        return publicUrl;
      }

      return data.path;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (
    url: string,
    bucket: 'job-media' | 'profile-images'
  ): Promise<boolean> => {
    try {
      // Extract file path from URL
      const path = extractStoragePath(url, bucket);
      if (!path) throw new Error('Invalid file URL');

      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      toast({ title: 'File deleted successfully!' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    getFileUrl,
    deleteFile,
    uploading,
    progress,
  };
}
