import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function DisputeResolution() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase
      .from('user_reports')
      .select(`
        *,
        reporter:profiles!user_reports_reporter_id_fkey(full_name, email),
        reported_user:profiles!user_reports_reported_user_id_fkey(full_name, email),
        reported_job:jobs(title)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setReports(data);
    }
  };

  const handleResolveReport = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from('user_reports')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update report status');
    } else {
      toast.success(`Report ${newStatus}`);
      fetchReports();
      setSelectedReport(null);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dispute Resolution</h2>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {pendingReports.length} Pending
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {new Date(report.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{report.reporter?.full_name || 'Anonymous'}</TableCell>
                  <TableCell>
                    {report.reported_user?.full_name || report.reported_job?.title || 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        report.status === 'pending'
                          ? 'destructive'
                          : report.status === 'resolved'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Report Details</DialogTitle>
                          <DialogDescription>
                            Review and resolve user report
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Reporter</h4>
                            <p>{report.reporter?.full_name} ({report.reporter?.email})</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Reported Entity</h4>
                            <p>
                              {report.reported_user
                                ? `User: ${report.reported_user.full_name} (${report.reported_user.email})`
                                : `Job: ${report.reported_job?.title}`}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Reason</h4>
                            <p>{report.reason}</p>
                          </div>
                          {report.description && (
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">
                                {report.description}
                              </p>
                            </div>
                          )}
                          {report.status === 'pending' && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => handleResolveReport(report.id, 'resolved')}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolve
                              </Button>
                              <Button
                                onClick={() => handleResolveReport(report.id, 'dismissed')}
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Dismiss
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
