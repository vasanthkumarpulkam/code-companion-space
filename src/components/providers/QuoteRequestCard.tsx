import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, DollarSign, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface QuoteRequestCardProps {
  request: any;
  onResponded: () => void;
}

export function QuoteRequestCard({ request, onResponded }: QuoteRequestCardProps) {
  const [responding, setResponding] = useState(false);
  const [quotedAmount, setQuotedAmount] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRespond = async () => {
    if (!quotedAmount || parseFloat(quotedAmount) <= 0) {
      toast({ title: 'Please enter a valid quote amount', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          quoted_amount: parseFloat(quotedAmount),
          quoted_at: new Date().toISOString(),
          status: 'quoted'
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({ title: 'Quote sent successfully!' });
      setResponding(false);
      onResponded();
    } catch (error: any) {
      toast({ title: 'Error sending quote', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-600';
      case 'soon': return 'bg-orange-600';
      default: return 'bg-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'quoted': return 'bg-green-600';
      case 'accepted': return 'bg-blue-600';
      case 'declined': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
            <CardDescription className="flex flex-wrap gap-2 items-center">
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
              <Badge className={getUrgencyColor(request.urgency)}>
                {request.urgency}
              </Badge>
              {request.preferred_pricing && request.preferred_pricing !== 'either' && (
                <Badge variant="outline">{request.preferred_pricing}</Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{request.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          {request.profiles && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{request.profiles.full_name || 'Customer'}</span>
            </div>
          )}
          {request.categories && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">{request.categories.name}</span>
            </div>
          )}
        </div>

        {request.quoted_amount && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
              <DollarSign className="h-5 w-5" />
              <span>Your Quote: ${request.quoted_amount}</span>
            </div>
            {request.quoted_at && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Sent {new Date(request.quoted_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {!responding && request.status === 'pending' && (
          <Button onClick={() => setResponding(true)} className="w-full">
            Send Quote
          </Button>
        )}

        {responding && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div>
              <label className="text-sm font-medium mb-1 block">Quote Amount ($) *</label>
              <Input
                type="number"
                placeholder="Enter your quote"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Additional Notes (Optional)</label>
              <Textarea
                placeholder="Add any additional details about your quote..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setResponding(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRespond} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Quote'}
              </Button>
            </div>
          </div>
        )}

        {request.status === 'quoted' && !request.quoted_amount && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Waiting for customer response...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
