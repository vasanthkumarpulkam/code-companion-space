import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];

export function SupportRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('open');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Failed to load support requests',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.subject?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setUpdatingStatus(true);
    const { error } = await supabase
      .from('support_requests')
      .update({ status: newStatus })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Status updated' });
      setSelectedRequest(null);
      fetchRequests();
    }
    setUpdatingStatus(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'in_progress':
        return <Badge>In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-600">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Requests</h2>
          <p className="text-sm text-muted-foreground">
            Manage inbound support tickets from customers and providers.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search support..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No support requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell className="max-w-[280px] truncate">{request.subject}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setNewStatus(request.status);
                            }}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Support Request</DialogTitle>
                            <DialogDescription>
                              Review request details and update status.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                  <Label>Name</Label>
                                  <p className="text-sm text-muted-foreground">{selectedRequest.name}</p>
                                </div>
                                <div>
                                  <Label>Email</Label>
                                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                                </div>
                                <div>
                                  <Label>Submitted</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedRequest.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status} value={status}>
                                          {status.replace('_', ' ')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label>Subject</Label>
                                <p className="text-sm text-muted-foreground">{selectedRequest.subject}</p>
                              </div>
                              <div>
                                <Label>Message</Label>
                                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                  {selectedRequest.message}
                                </p>
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button onClick={handleUpdateStatus} disabled={updatingStatus}>
                              {updatingStatus ? 'Updating...' : 'Update Status'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
