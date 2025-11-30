import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceState {
  [userId: string]: {
    online_at: string;
    user_id: string;
  }[];
}

export function useUserPresence(channelName: string, userId: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [channelRef, setChannelRef] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state: PresenceState = channel.presenceState();
        const online = new Set<string>();
        
        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            online.add(key);
          }
        });
        
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
        setOnlineUsers(prev => new Set(prev).add(key));
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannelRef(channel);

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, [channelName, userId]);

  return {
    onlineUsers,
    isOnline: (checkUserId: string) => onlineUsers.has(checkUserId),
  };
}
