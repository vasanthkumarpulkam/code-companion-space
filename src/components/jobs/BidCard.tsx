import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, MessageCircle } from 'lucide-react';
import ProviderBadges from '@/components/providers/ProviderBadges';
import { useNavigate } from 'react-router-dom';

interface BidCardProps {
  bid: any;
  isOwner: boolean;
  onAward: () => void;
}

export default function BidCard({ bid, isOwner, onAward }: BidCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar 
              className="cursor-pointer"
              onClick={() => navigate(`/profile/${bid.provider_id}`)}
            >
              <AvatarFallback>
                {bid.profiles?.full_name?.[0] || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p 
                  className="font-medium cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${bid.provider_id}`)}
                >
                  {bid.profiles?.full_name || 'Provider'}
                </p>
                <Badge
                  variant={
                    bid.status === 'awarded'
                      ? 'default'
                      : bid.status === 'rejected'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {bid.status}
                </Badge>
                <ProviderBadges providerId={bid.provider_id} inline />
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bid.proposal}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-lg font-semibold text-primary">${bid.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(bid.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/chats?job=${bid.job_id}&provider=${bid.provider_id}`)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                {bid.status === 'pending' && (
                  <Button onClick={onAward} size="sm">
                    <Award className="mr-2 h-4 w-4" />
                    Award
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
