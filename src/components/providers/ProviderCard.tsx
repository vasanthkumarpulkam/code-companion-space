import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Clock, DollarSign, CheckCircle, Heart } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ProviderBadges from '@/components/providers/ProviderBadges';

interface ProviderCardProps {
  provider: any;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const settings = provider.provider_settings?.[0];
  const skills = provider.provider_skills?.slice(0, 3) || [];

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({ title: "Please login to save providers" });
      return;
    }

    setSaving(true);
    
    if (isSaved) {
      await supabase
        .from('saved_providers')
        .delete()
        .eq('user_id', user.id)
        .eq('provider_id', provider.id);
      setIsSaved(false);
      toast({ title: "Provider removed from favorites" });
    } else {
      await supabase
        .from('saved_providers')
        .insert({ user_id: user.id, provider_id: provider.id });
      setIsSaved(true);
      toast({ title: "Provider saved to favorites" });
    }
    
    setSaving(false);
  };

  return (
    <Link to={`/profile/${provider.id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer h-full relative">
        <button
          onClick={toggleSave}
          disabled={saving}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>

        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium shrink-0">
              {provider.full_name?.[0] || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{provider.full_name}</h3>
                {settings?.accepts_instant_bookings && (
                  <Badge variant="secondary" className="shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Instant
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {settings?.bio_headline || 'Professional Service Provider'}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {provider.avgRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({provider.reviewCount})
                  </span>
                </div>
                {settings?.available_now && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Available Now
                  </Badge>
                )}
              </div>
              <div className="mt-2">
                <ProviderBadges providerId={provider.id} inline />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {provider.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{provider.location}</span>
            </div>
          )}

          {settings?.hourly_rate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">${settings.hourly_rate}/hr</span>
              {settings.response_time_hours && (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
                  <span className="text-muted-foreground">~{settings.response_time_hours}h response</span>
                </>
              )}
            </div>
          )}

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill.skill_name}
                  {skill.verified && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-600" />
                  )}
                </Badge>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full" asChild>
            <span>View Profile & Request Quote</span>
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}