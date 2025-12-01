import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, DollarSign, AlertTriangle, Settings, FileText, Eye, Award, Download, Trash2, RefreshCw, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FinancialReports } from '@/components/admin/FinancialReports';
import { DisputeResolution } from '@/components/admin/DisputeResolution';
import { UserManagement } from '@/components/admin/UserManagement';
import { PlatformSettings } from '@/components/admin/PlatformSettings';
import { BadgeManagement } from '@/components/admin/BadgeManagement';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Admin() {
  const { user, userRole } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalRevenue: 0,
    pendingDisputes: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (userRole === 'admin') {
      loadData();
    }
  }, [userRole]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchJobs()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [usersCount, jobsCount, paymentsData, reportsData] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('customer_fee, provider_fee').eq('status', 'completed'),
      supabase.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = paymentsData.data?.reduce(
      (sum, p) => sum + Number(p.customer_fee) + Number(p.provider_fee),
      0
    ) || 0;

    setStats({
      totalUsers: usersCount.count || 0,
      totalJobs: jobsCount.count || 0,
      totalRevenue,
      pendingDisputes: reportsData.count || 0,
    });
  };

  const fetchUsers = async () => {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesData) {
      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            user_roles: rolesData || []
          };
        })
      );
      
      setUsers(usersWithRoles);
    }
  };

  const fetchJobs = async () => {
    let query = supabase
      .from('jobs')
      .select('*, profiles!jobs_customer_id_fkey(full_name), categories(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobStatusFilter !== 'all') {
      query = query.eq('status', jobStatusFilter);
    }

    const { data } = await query;
    setJobs(data || []);
  };

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (!error) {
      fetchJobs();
      fetchStats();
    }
  };

  const handleChangeJobStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (!error) {
      fetchJobs();
      fetchStats();
    }
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch(type) {
      case 'users':
        data = users.map(u => ({
          Name: u.full_name,
          Email: u.email,
          Role: u.user_roles?.map((r: any) => r.role).join(', '),
          Location: u.location,
          Joined: new Date(u.created_at).toLocaleDateString()
        }));
        filename = 'users_export.csv';
        break;
      case 'jobs':
        data = jobs.map(j => ({
          Title: j.title,
          Category: j.categories?.name,
          Customer: j.profiles?.full_name,
          Status: j.status,
          Budget: j.budget,
          Created: new Date(j.created_at).toLocaleDateString()
        }));
        filename = 'jobs_export.csv';
        break;
    }

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage platform operations and users</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDisputes}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="analytics">
              <FileText className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="financial">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="disputes">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Job Oversight</CardTitle>
                  <div className="flex gap-2">
                    <Select value={jobStatusFilter} onValueChange={(val) => {
                      setJobStatusFilter(val);
                      fetchJobs();
                    }}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchJobs}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportData('jobs')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : jobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No jobs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {job.title}
                          </TableCell>
                          <TableCell>{job.categories?.name}</TableCell>
                          <TableCell>{job.profiles?.full_name || 'Anonymous'}</TableCell>
                          <TableCell>
                            <Select
                              value={job.status}
                              onValueChange={(val) => handleChangeJobStatus(job.id, val)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="awarded">Awarded</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="canceled">Canceled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>${job.budget}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/jobs/${job.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure? This will permanently delete this job and all associated bids.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="disputes">
            <DisputeResolution />
          </TabsContent>

          <TabsContent value="badges">
            <BadgeManagement />
          </TabsContent>

          <TabsContent value="settings">
            <PlatformSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
    </>
  );
}
