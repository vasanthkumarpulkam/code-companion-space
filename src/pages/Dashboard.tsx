import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, Star, Plus, Search, MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'customer' && 'Manage your posted jobs and find local service providers'}
              {userRole === 'provider' && 'Browse available jobs and manage your bids'}
              {userRole === 'admin' && 'Platform administration and oversight'}
            </p>
          </div>

          {/* Customer Dashboard */}
          {userRole === 'customer' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Jobs currently open</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">On completed jobs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reviews Given</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Provider reviews</p>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Post a New Job</CardTitle>
                    <CardDescription>
                      Describe your task and get bids from local providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to="/jobs/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Job Posting
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Find Providers</CardTitle>
                    <CardDescription>
                      Browse available service providers in your area
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/services">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Services
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Jobs</CardTitle>
                  <CardDescription>View and manage your job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">You haven't posted any jobs yet</p>
                    <Button asChild>
                      <Link to="/jobs/new">Post Your First Job</Link>
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
                    <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">Pending proposals</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                    <p className="text-xs text-muted-foreground">From completed jobs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Your Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">No reviews yet</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="recommended" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recommended">Recommended Jobs</TabsTrigger>
                  <TabsTrigger value="mybids">My Bids</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommended" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended for You</CardTitle>
                      <CardDescription>Jobs matching your skills and location</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">Complete your profile to see recommended jobs</p>
                        <Button asChild variant="outline">
                          <Link to="/profile/edit">Complete Profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="mybids" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Bids</CardTitle>
                      <CardDescription>Track your active and past proposals</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">You haven't submitted any bids yet</p>
                        <Button asChild>
                          <Link to="/services">Browse Jobs</Link>
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
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Tools</CardTitle>
                  <CardDescription>Platform management and oversight</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Admin features coming soon...</p>
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
