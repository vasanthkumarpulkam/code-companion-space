import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, DollarSign, User, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function MyQuotes() {
  const { user } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuoteRequests();
    }
  }, [user]);

  const fetchQuoteRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          profiles:provider_id (full_name, email, location, avatar_url),
          categories (name)
        `)
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuoteRequests(data || []);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      toast({ title: 'Error loading quotes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: 'Quote accepted!' });
      fetchQuoteRequests();
    } catch (error: any) {
      toast({ title: 'Error accepting quote', description: error.message, variant: 'destructive' });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: 'Quote declined' });
      fetchQuoteRequests();
    } catch (error: any) {
      toast({ title: 'Error declining quote', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'quoted': return 'bg-blue-600';
      case 'accepted': return 'bg-green-600';
      case 'declined': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const pendingQuotes = quoteRequests.filter(q => q.status === 'pending' || q.status === 'quoted');
  const completedQuotes = quoteRequests.filter(q => q.status === 'accepted' || q.status === 'declined');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Quote Requests</h1>
            <p className="text-muted-foreground">
              Track your direct quote requests to providers
            </p>
          </div>

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">
                Active ({pendingQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History ({completedQuotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              ) : pendingQuotes.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground text-lg mb-4">No active quote requests</p>
                  <p className="text-sm text-muted-foreground">
                    Browse providers and request quotes directly from their profiles
                  </p>
                  <Button asChild className="mt-6">
                    <a href="/providers">Find Providers</a>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingQuotes.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                            <CardDescription>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm">{request.description}</p>

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
                              <span>{request.profiles.full_name || 'Provider'}</span>
                            </div>
                          )}
                          {request.categories && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-medium">{request.categories.name}</span>
                            </div>
                          )}
                        </div>

                        {request.quoted_amount ? (
                          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                                <DollarSign className="h-5 w-5" />
                                <span>Provider Quote: ${request.quoted_amount}</span>
                              </div>
                            </div>
                            {request.quoted_at && (
                              <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                                Received {new Date(request.quoted_at).toLocaleDateString()}
                              </p>
                            )}
                            {request.status === 'quoted' && (
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => handleAccept(request.id)}
                                  className="flex-1"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept Quote
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleDecline(request.id)}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Waiting for provider to send quote...
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : completedQuotes.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">No quote history yet</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedQuotes.map((request) => (
                    <Card key={request.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <Badge className={getStatusColor(request.status)} variant="secondary">
                              {request.status}
                            </Badge>
                          </div>
                          {request.quoted_amount && (
                            <div className="text-right">
                              <p className="font-semibold">${request.quoted_amount}</p>
                              <p className="text-xs text-muted-foreground">Quote</p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
