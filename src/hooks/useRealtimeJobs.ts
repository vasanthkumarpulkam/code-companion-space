import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeJobs(onJobUpdate: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          onJobUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onJobUpdate]);
}
