import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_name: string;
  user_email: string;
  timestamp: string;
  details?: string;
}

export function AuditLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setLoading(true);
    
    // Fetch recent jobs (created/updated)
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select('id, title, status, created_at, updated_at, profiles!jobs_customer_id_fkey(full_name, email)')
      .order('updated_at', { ascending: false })
      .limit(20);

    // Fetch recent bids
    const { data: recentBids } = await supabase
      .from('bids')
      .select('id, status, amount, created_at, updated_at, jobs(title), profiles!bids_provider_id_fkey(full_name, email)')
      .order('updated_at', { ascending: false })
      .limit(20);

    // Fetch recent reviews with separate profile lookup
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('id, rating, created_at, reviewer_id, jobs(title)')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch reviewer profiles
    const reviewerIds = recentReviews?.map(r => r.reviewer_id) || [];
    const { data: reviewerProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', reviewerIds);

    // Fetch recent reports
    const { data: recentReports } = await supabase
      .from('user_reports')
      .select('id, reason, status, created_at, reviewed_at, reporter_id')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch reporter profiles
    const reporterIds = recentReports?.map(r => r.reporter_id) || [];
    const { data: reporterProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', reporterIds);

    // Compile activity log
    const activityList: ActivityLog[] = [];

    recentJobs?.forEach(job => {
      activityList.push({
        id: `job-${job.id}`,
        action: 'Job posted',
        entity_type: 'Job',
        entity_id: job.id,
        user_name: job.profiles?.full_name || 'Unknown',
        user_email: job.profiles?.email || '',
        timestamp: job.created_at,
        details: `"${job.title}" - Status: ${job.status}`
      });
    });

    recentBids?.forEach(bid => {
      activityList.push({
        id: `bid-${bid.id}`,
        action: bid.status === 'awarded' ? 'Bid awarded' : bid.status === 'rejected' ? 'Bid rejected' : 'Bid submitted',
        entity_type: 'Bid',
        entity_id: bid.id,
        user_name: bid.profiles?.full_name || 'Unknown',
        user_email: bid.profiles?.email || '',
        timestamp: bid.updated_at || bid.created_at,
        details: `$${bid.amount} on "${bid.jobs?.title}"`
      });
    });

    recentReviews?.forEach(review => {
      const reviewer = reviewerProfiles?.find(p => p.id === review.reviewer_id);
      activityList.push({
        id: `review-${review.id}`,
        action: 'Review posted',
        entity_type: 'Review',
        entity_id: review.id,
        user_name: reviewer?.full_name || 'Unknown',
        user_email: reviewer?.email || '',
        timestamp: review.created_at,
        details: `${review.rating} stars for "${review.jobs?.title}"`
      });
    });

    recentReports?.forEach(report => {
      const reporter = reporterProfiles?.find(p => p.id === report.reporter_id);
      activityList.push({
        id: `report-${report.id}`,
        action: report.reviewed_at ? `Report ${report.status}` : 'Report submitted',
        entity_type: 'Report',
        entity_id: report.id,
        user_name: reporter?.full_name || 'Unknown',
        user_email: reporter?.email || '',
        timestamp: report.reviewed_at || report.created_at,
        details: report.reason
      });
    });

    // Sort by timestamp
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivities(activityList);
    setLoading(false);
  };

  const handleExportLog = () => {
    const headers = ['Timestamp', 'Action', 'Type', 'User', 'Email', 'Details'];
    const csvData = filteredActivities.map(activity => [
      new Date(activity.timestamp).toLocaleString(),
      activity.action,
      activity.entity_type,
      activity.user_name,
      activity.user_email,
      activity.details || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported successfully');
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('awarded') || action.includes('completed')) return 'default';
    if (action.includes('rejected') || action.includes('dismissed')) return 'destructive';
    if (action.includes('submitted') || action.includes('posted')) return 'secondary';
    return 'outline';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || activity.entity_type.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Activity Log
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRecentActivity}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLog}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="job">Jobs</SelectItem>
            <SelectItem value="bid">Bids</SelectItem>
            <SelectItem value="review">Reviews</SelectItem>
            <SelectItem value="report">Reports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading activity...</TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No activity found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(activity.action)}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.entity_type}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.user_name}</p>
                          <p className="text-xs text-muted-foreground">{activity.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {activity.details}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}