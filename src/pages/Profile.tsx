import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Briefcase, MessageSquare, Calendar, Award } from 'lucide-react';

export default function Profile() {
  const { uid } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchCompletedJobs();
    fetchReviews();
  }, [uid]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, user_roles(role)')
      .eq('id', uid)
      .single();

    setProfile(data);
    setLoading(false);
  };

  const fetchCompletedJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*, categories(name)')
      .eq('awarded_provider_id', uid)
      .eq('status', 'completed')
      .limit(6);

    setCompletedJobs(data || []);
  };

  const fetchReviews = async () => {
    // Placeholder for reviews - would need a reviews table
    setReviews([]);
  };

  if (loading) {
    return <div className="container py-8">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="container py-8">Profile not found</div>;
  }

  const isProvider = profile.user_roles?.some((r: any) => r.role === 'provider');
  const averageRating = 4.8; // Placeholder
  const totalReviews = 24; // Placeholder
  const completedJobsCount = completedJobs.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary/5 border-b">
        <div className="container py-12">
          <div className="flex items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="text-3xl">
                {profile.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name || 'Anonymous'}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{averageRating}</span>
                    <span>({totalReviews} reviews)</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex gap-3">
                {user?.id !== uid && (
                  <>
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline">Request Quote</Button>
                  </>
                )}
              </div>
            </div>

            {isProvider && (
              <Card className="w-64">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed Jobs</span>
                    <span className="text-2xl font-bold">{completedJobsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <span className="text-2xl font-bold">{averageRating}</span>
                  </div>
                  <Badge variant="secondary" className="w-full justify-center">
                    Available
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            <h2 className="text-2xl font-bold">Completed Work</h2>
            
            {completedJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No completed jobs yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardContent className="pt-4">
                      <Badge variant="secondary" className="mb-2">
                        {job.categories?.name}
                      </Badge>
                      <h3 className="font-semibold line-clamp-2">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {job.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
            
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <h2 className="text-2xl font-bold">About</h2>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">
                    {profile.bio || 'No bio provided'}
                  </p>
                </div>

                {profile.location && (
                  <div>
                    <h3 className="font-semibold mb-2">Service Area</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Member Since</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
