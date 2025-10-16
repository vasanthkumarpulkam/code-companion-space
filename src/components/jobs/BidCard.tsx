import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award } from 'lucide-react';

interface BidCardProps {
  bid: any;
  isOwner: boolean;
  onAward: () => void;
}

export default function BidCard({ bid, isOwner, onAward }: BidCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <AvatarFallback>
                {bid.profiles?.full_name?.[0] || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">{bid.profiles?.full_name || 'Provider'}</p>
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
              </div>
              <p className="text-sm text-muted-foreground">{bid.proposal}</p>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold">${bid.amount}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(bid.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          {isOwner && bid.status === 'pending' && (
            <Button onClick={onAward} size="sm">
              <Award className="mr-2 h-4 w-4" />
              Award
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
