import { supabase } from '@/integrations/supabase/client';

export type PublicProfile = {
  id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  language_preference: string | null;
  created_at: string | null;
  email?: string | null;
  is_public?: boolean | null;
  show_email?: boolean | null;
};

const PUBLIC_PROFILE_SELECT =
  'id, full_name, avatar_url, bio, location, language_preference, created_at, email, is_public, show_email';

export async function fetchPublicProfilesByIds(
  ids: Array<string | null | undefined>
): Promise<Map<string, PublicProfile>> {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)));
  if (uniqueIds.length === 0) {
    return new Map<string, PublicProfile>();
  }

  const { data } = await supabase
    .from('public_profiles')
    .select(PUBLIC_PROFILE_SELECT)
    .in('id', uniqueIds);

  const profileMap = new Map<string, PublicProfile>();
  (data || []).forEach((profile) => {
    if (profile.id) {
      profileMap.set(profile.id, profile);
    }
  });

  return profileMap;
}
