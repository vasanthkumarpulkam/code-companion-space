import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MapPin, DollarSign, Calendar, MessageSquare, Award, Languages, Flag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import BidCard from '@/components/jobs/BidCard';
import { useRealtimeBids } from '@/hooks/useRealtimeBids';
import { ReportDialog } from '@/components/jobs/ReportDialog';
import { analytics } from '@/utils/analytics';

export default function JobDetail() {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBidsCallback = useCallback(() => {
    fetchBids();
  }, [id]);

  // Real-time bid updates
  useRealtimeBids(id, fetchBidsCallback);

  useEffect(() => {
    fetchJobDetails();
    fetchBids();
  }, [id]);

  const fetchJobDetails = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, categories(name), profiles!jobs_customer_id_fkey(full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (!error && data) {
      setJob(data);
    }
    setLoading(false);
  };

  const fetchBids = async () => {
    if (!user) return;

    let query = supabase
      .from('bids')
      .select('*, profiles!bids_provider_id_fkey(full_name, avatar_url)')
      .eq('job_id', id);

    const { data } = await query;
    setBids(data || []);
  };

  const submitBid = async () => {
    if (!user || !bidAmount || !bidProposal) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('bids').insert({
        job_id: id,
        provider_id: user.id,
        amount: parseFloat(bidAmount),
        proposal: bidProposal,
      });

      if (error) throw error;

      toast({ title: 'Bid submitted successfully!' });
      analytics.trackBidSubmitted(id!, parseFloat(bidAmount));
      setBidAmount('');
      setBidProposal('');
      fetchBids();
    } catch (error: any) {
      toast({ title: 'Error submitting bid', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const awardBid = async (bidId: string, providerId: string) => {
    try {
      // Update job status and awarded provider
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ status: 'awarded', awarded_provider_id: providerId })
        .eq('id', id);

      if (jobError) throw jobError;

      // Update bid statuses
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'awarded' })
        .eq('id', bidId);

      if (bidError) throw bidError;

      // Reject other bids
      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', id)
        .neq('id', bidId);

      toast({ title: 'Bid awarded successfully!' });
      analytics.trackJobAwarded(id!, providerId);
      fetchJobDetails();
      fetchBids();
    } catch (error: any) {
      toast({ title: 'Error awarding bid', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!job) {
    return <div className="container py-8">Job not found</div>;
  }

  const isOwner = user?.id === job.customer_id;
  const canBid = userRole === 'provider' && job.status === 'open' && !isOwner;
  const needsAuth = !user && job.status === 'open';

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge>{job.categories?.name}</Badge>
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                  {!isOwner && <ReportDialog jobId={id} />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${job.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground">{job.description}</p>
              </div>

              {job.description_spanish && (
                <Button variant="outline" size="sm">
                  <Languages className="mr-2 h-4 w-4" />
                  View in Spanish
                </Button>
              )}
            </CardContent>
          </Card>

          {needsAuth && (
            <Card>
              <CardHeader>
                <CardTitle>Interested in this job?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Login or sign up to submit a bid for this job
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/auth/login')} className="flex-1">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/auth/signup')} variant="outline" className="flex-1">
                    Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {canBid && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Bid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Bid Amount ($)</label>
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter your bid"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Proposal</label>
                  <Textarea
                    value={bidProposal}
                    onChange={(e) => setBidProposal(e.target.value)}
                    placeholder="Explain why you're the best fit for this job..."
                    className="min-h-32"
                  />
                </div>
                <Button onClick={submitBid} disabled={submitting} className="w-full">
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Bids ({bids.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bids.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No bids yet</p>
              ) : (
                bids.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    isOwner={isOwner}
                    onAward={() => awardBid(bid.id, bid.provider_id)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {job.profiles?.full_name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium">{job.profiles?.full_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">Customer</p>
                </div>
              </div>
              {!isOwner && (
                <Button variant="outline" className="w-full mt-4">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
