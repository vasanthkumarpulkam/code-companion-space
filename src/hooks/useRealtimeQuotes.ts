import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeQuotes(userId: string | undefined, onQuoteUpdate: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('quote-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_requests',
          filter: `customer_id=eq.${userId}`
        },
        (payload) => {
          console.log('Quote update received:', payload);
          onQuoteUpdate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_requests',
          filter: `provider_id=eq.${userId}`
        },
        (payload) => {
          console.log('Quote update received:', payload);
          onQuoteUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onQuoteUpdate]);
}
