import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';

interface BidSubmissionFormProps {
  jobId: string;
  jobBudget: number;
  onSuccess: () => void;
}

export default function BidSubmissionForm({ jobId, jobBudget, onSuccess }: BidSubmissionFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [proposal, setProposal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a bid',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || !proposal) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both an amount and proposal',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('bids').insert({
      job_id: jobId,
      provider_id: user.id,
      amount: parseFloat(amount),
      proposal: proposal,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Your bid has been submitted',
      });
      setAmount('');
      setProposal('');
      onSuccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Bid</CardTitle>
        <CardDescription>
          Customer's budget: ${jobBudget.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Your Bid Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your competitive price for this job
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal">Your Proposal</Label>
            <div className="relative">
              <Textarea
                id="proposal"
                placeholder="Explain why you're the best fit for this job, your experience, timeline, and what makes your offer competitive..."
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                rows={6}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters. Be detailed and professional.
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting...' : 'Submit Bid'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
