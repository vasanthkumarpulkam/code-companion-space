import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Star, Plus, Search, MessageCircle, User, MapPin, Calendar, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalSpent: 0,
    reviewsGiven: 0,
    activeBids: 0,
    totalEarned: 0,
    rating: 0,
    totalUsers: 0,
    totalJobsAdmin: 0,
    platformFees: 0,
    reports: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user, userRole]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();

    if (!error) {
      setProfile(data);
    }
  };

  const fetchStats = async () => {
    if (userRole === 'customer') {
      // Fetch customer stats
      const [jobsData, paymentsData, reviewsData] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('customer_id', user?.id).in('status', ['open', 'awarded', 'in_progress']),
        supabase.from('payments').select('customer_fee').eq('customer_id', user?.id).eq('status', 'completed'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', user?.id)
      ]);

      const totalSpent = paymentsData.data?.reduce((sum, p) => sum + Number(p.customer_fee), 0) || 0;

      setStats(prev => ({
        ...prev,
        activeJobs: jobsData.count || 0,
        totalSpent,
        reviewsGiven: reviewsData.count || 0
      }));
    } else if (userRole === 'provider') {
      // Fetch provider stats
      const [bidsData, paymentsData, reviewsData] = await Promise.all([
        supabase.from('bids').select('id', { count: 'exact', head: true }).eq('provider_id', user?.id).eq('status', 'pending'),
        supabase.from('payments').select('provider_fee').eq('provider_id', user?.id).eq('status', 'completed'),
        supabase.from('reviews').select('rating').eq('reviewed_id', user?.id)
      ]);

      const totalEarned = paymentsData.data?.reduce((sum, p) => sum + Number(p.provider_fee), 0) || 0;
      const avgRating = reviewsData.data && reviewsData.data.length > 0
        ? reviewsData.data.reduce((sum, r) => sum + r.rating, 0) / reviewsData.data.length
        : 0;

      setStats(prev => ({
        ...prev,
        activeBids: bidsData.count || 0,
        totalEarned,
        rating: avgRating
      }));
    } else if (userRole === 'admin') {
      // Fetch admin stats
      const [usersData, jobsData, paymentsData, reportsData] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).in('status', ['open', 'awarded', 'in_progress']),
        supabase.from('payments').select('customer_fee, provider_fee').eq('status', 'completed'),
        supabase.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      const platformFees = paymentsData.data?.reduce(
        (sum, p) => sum + Number(p.customer_fee) + Number(p.provider_fee),
        0
      ) || 0;

      setStats(prev => ({
        ...prev,
        totalUsers: usersData.count || 0,
        totalJobsAdmin: jobsData.count || 0,
        platformFees,
        reports: reportsData.count || 0
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t('dashboard.welcome')}, {user?.user_metadata?.full_name || profile?.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'customer' && t('dashboard.customer.subtitle')}
              {userRole === 'provider' && t('dashboard.provider.subtitle')}
              {userRole === 'admin' && t('dashboard.admin.subtitle')}
            </p>
          </div>

          {/* Profile Overview Card */}
          {profile && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{profile.full_name || t('dashboard.profile.complete')}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                          {profile.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {profile.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {t('dashboard.profile.memberSince')} {new Date(profile.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link to={`/profile/${user?.id}`}>
                            <User className="h-4 w-4 mr-2" />
                            {t('dashboard.profile.viewProfile')}
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link to="/profile/edit">
                            <Edit className="h-4 w-4 mr-2" />
                            {t('dashboard.profile.edit')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                    {profile.bio && (
                      <p className="mt-4 text-muted-foreground">{profile.bio}</p>
                    )}
                    {profile.role === "provider" && profile.skills && profile.skills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">{t('dashboard.profile.skills')}</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Dashboard */}
          {userRole === 'customer' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.activeJobs')}</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeJobs}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.jobsOpen')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalSpent')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.onCompleted')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.reviewsGiven')}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.reviewsGiven}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.providerReviews')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.postJob.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.postJob.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to="/jobs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('dashboard.postJob.button')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('dashboard.findProviders.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.findProviders.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/services">
                        <Search className="mr-2 h-4 w-4" />
                        {t('dashboard.findProviders.button')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.yourJobs.title')}</CardTitle>
                  <CardDescription>{t('dashboard.yourJobs.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">{t('dashboard.yourJobs.empty')}</p>
                    <Button asChild>
                      <Link to="/jobs/new">{t('dashboard.yourJobs.firstJob')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Provider Dashboard */}
          {userRole === 'provider' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.activeBids')}</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeBids}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.pendingProposals')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.totalEarned')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.totalEarned.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.fromCompleted')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.stats.yourRating')}</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.rating > 0 ? stats.rating.toFixed(1) : '—'}</div>
                    <p className="text-xs text-muted-foreground">{t('dashboard.stats.noReviews')}</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="recommended" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommended">{t('dashboard.tabs.recommended')}</TabsTrigger>
                  <TabsTrigger value="mybids">{t('dashboard.tabs.mybids')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommended" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard.recommended.title')}</CardTitle>
                      <CardDescription>{t('dashboard.recommended.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">{t('dashboard.recommended.empty')}</p>
                        <Button asChild variant="outline">
                          <Link to="/profile/edit">{t('dashboard.recommended.complete')}</Link>
                        </Button>
                      </div>
                      <div className="mt-4 text-center">
                        <Button asChild>
                          <Link to="/jobs">{t('dashboard.recommended.browse')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="mybids" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('dashboard.yourBids.title')}</CardTitle>
                      <CardDescription>{t('dashboard.yourBids.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">{t('dashboard.yourBids.empty')}</p>
                        <Button asChild>
                          <Link to="/jobs">{t('dashboard.yourBids.browse')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Admin Dashboard */}
          {userRole === 'admin' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.admin.totalUsers')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.admin.activeJobs')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalJobsAdmin}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.admin.platformFees')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.platformFees.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('dashboard.admin.reports')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.reports}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.admin.tools')}</CardTitle>
                  <CardDescription>{t('dashboard.admin.toolsDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link to="/admin">{t('dashboard.admin.goToPanel')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
