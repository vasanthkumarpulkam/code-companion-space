import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeBids(jobId: string | undefined, onBidUpdate: () => void) {
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`bids-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `job_id=eq.${jobId}`
        },
        () => {
          onBidUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, onBidUpdate]);
}
