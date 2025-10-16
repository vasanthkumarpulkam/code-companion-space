import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Search, MapPin, DollarSign, Calendar } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';

export default function Jobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchJobs();
  }, [sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*, categories(name), profiles!jobs_customer_id_fkey(full_name)')
      .eq('status', 'open');

    if (sortBy === 'date') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'budget') {
      query = query.order('budget', { ascending: false });
    }

    const { data, error } = await query;
    
    if (!error) {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Jobs</h1>
            <p className="text-muted-foreground">Find your next opportunity</p>
          </div>
          <Link to="/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <JobFilters />
          </aside>

          <main className="lg:col-span-3 space-y-6">
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Most Recent</SelectItem>
                    <SelectItem value="budget">Highest Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {loading ? (
              <div className="text-center py-12">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No jobs found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Link to="/jobs/new">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Post Job
        </Button>
      </Link>
    </div>
  );
}
