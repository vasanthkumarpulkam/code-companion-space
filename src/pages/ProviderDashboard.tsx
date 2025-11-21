import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBids: 0, activeBids: 0, wonBids: 0 });

  const fetchAvailableJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        categories(name, slug),
        profiles(full_name, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) setAvailableJobs(data);
  };

  const fetchMyBids = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        jobs(
          id,
          title,
          budget,
          location,
          status,
          categories(name),
          profiles(full_name)
        )
      `)
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyBids(data);
      setStats({
        totalBids: data.length,
        activeBids: data.filter(b => b.status === 'pending').length,
        wonBids: data.filter(b => b.status === 'awarded').length
      });
    }
  };

  const fetchActiveJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        categories(name),
        profiles(full_name, avatar_url)
      `)
      .eq('awarded_provider_id', user.id)
      .in('status', ['awarded', 'in_progress'])
      .order('created_at', { ascending: false });

    if (!error && data) setActiveJobs(data);
  };

  useEffect(() => {
    Promise.all([fetchAvailableJobs(), fetchMyBids(), fetchActiveJobs()]).finally(() => {
      setLoading(false);
    });
  }, [user]);

  useRealtimeJobs(() => {
    fetchAvailableJobs();
    fetchMyBids();
    fetchActiveJobs();
  });

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'awarded': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your bids and find new opportunities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBids}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeBids}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Won Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.wonBids}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">Available Jobs</TabsTrigger>
              <TabsTrigger value="mybids">My Bids</TabsTrigger>
              <TabsTrigger value="active">Active Jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : availableJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No available jobs at the moment
                  </CardContent>
                </Card>
              ) : (
                availableJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge variant="outline">{job.categories?.name}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Budget: ${job.budget}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/jobs/${job.id}`)}>
                          View & Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="mybids" className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : myBids.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    You haven't submitted any bids yet
                  </CardContent>
                </Card>
              ) : (
                myBids.map((bid) => (
                  <Card key={bid.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{bid.jobs?.title}</h3>
                            <Badge variant={getBidStatusColor(bid.status)}>
                              {bid.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your bid: ${bid.amount}
                          </p>
                          <p className="text-sm mb-4 line-clamp-2">{bid.proposal}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(bid.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/jobs/${bid.jobs?.id}`)}
                        >
                          View Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : activeJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No active jobs at the moment
                  </CardContent>
                </Card>
              ) : (
                activeJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            <Badge>{job.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              Customer: {job.profiles?.full_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/jobs/${job.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
