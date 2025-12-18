import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Eye, Trash2, Search, Download, RefreshCw } from 'lucide-react';

export function JobOversight() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, [statusFilter, categoryFilter]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*, profiles!jobs_customer_id_fkey(full_name, email), categories(name)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }

    const { data } = await query;
    setJobs(data || []);
    setLoading(false);
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);

    if (error) {
      toast.error('Failed to delete job: ' + error.message);
    } else {
      toast.success(`Job "${title}" deleted successfully`);
      fetchJobs();
    }
  };

  const handleUpdateStatus = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId);

    if (error) {
      toast.error('Failed to update status: ' + error.message);
    } else {
      toast.success('Job status updated');
      fetchJobs();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Customer', 'Status', 'Budget', 'Location', 'Created'];
    const csvData = filteredJobs.map(job => [
      job.title,
      job.categories?.name || '',
      job.profiles?.full_name || 'Anonymous',
      job.status,
      job.budget,
      job.location,
      new Date(job.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Jobs exported successfully');
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'awarded': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'canceled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Job Oversight</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="awarded">Awarded</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs ({filteredJobs.length})</CardTitle>
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
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Loading jobs...</TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {job.title}
                    </TableCell>
                    <TableCell>{job.categories?.name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{job.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{job.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={job.status}
                        onValueChange={(value) => handleUpdateStatus(job.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <Badge variant={getStatusBadgeVariant(job.status)}>
                            {job.status}
                          </Badge>
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
                    <TableCell className="max-w-[150px] truncate">{job.location}</TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/jobs/${job.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Job</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{job.title}"? This action cannot be undone
                                and will remove all associated bids and messages.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteJob(job.id, job.title)}
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
    </div>
  );
}