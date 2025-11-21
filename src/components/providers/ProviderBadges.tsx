import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, Zap, Award, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProviderBadgesProps {
  providerId: string;
  inline?: boolean;
}

const BADGE_CONFIG = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    description: 'Identity and credentials verified',
    color: 'bg-blue-500',
  },
  top_rated: {
    icon: Star,
    label: 'Top Rated',
    description: 'Consistently high ratings from customers',
    color: 'bg-yellow-500',
  },
  fast_response: {
    icon: Zap,
    label: 'Fast Response',
    description: 'Responds within 1 hour on average',
    color: 'bg-green-500',
  },
  quality_pro: {
    icon: Award,
    label: 'Quality Pro',
    description: 'Exceptional work quality',
    color: 'bg-purple-500',
  },
  background_checked: {
    icon: Shield,
    label: 'Background Checked',
    description: 'Background check completed',
    color: 'bg-red-500',
  },
};

export default function ProviderBadges({ providerId, inline = false }: ProviderBadgesProps) {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [providerId]);

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from('provider_badges')
      .select('*')
      .eq('provider_id', providerId)
      .is('expires_at', null)
      .or(`expires_at.gt.${new Date().toISOString()}`);

    if (!error && data) {
      setBadges(data);
    }
    setLoading(false);
  };

  if (loading || badges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={inline ? 'flex gap-1' : 'flex flex-wrap gap-2'}>
        {badges.map((badge) => {
          const config = BADGE_CONFIG[badge.badge_type as keyof typeof BADGE_CONFIG];
          if (!config) return null;

          const Icon = config.icon;

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="gap-1">
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{config.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
