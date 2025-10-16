import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, List, Map } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import { AdvancedFilters } from '@/components/jobs/AdvancedFilters';
import { JobMapView } from '@/components/jobs/JobMapView';
import { useAdvancedSearch, SearchFilters } from '@/hooks/useAdvancedSearch';
import { analytics } from '@/utils/analytics';

export default function Jobs() {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'recent',
    datePosted: 'all'
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { jobs, loading } = useAdvancedSearch(filters);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    analytics.trackSearch(value, filters);
  };

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

        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={filters.query || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('map')}
                  title="Map View"
                >
                  <Map className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <AdvancedFilters filters={filters} onFiltersChange={setFilters} />

          {loading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </Card>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                  </div>
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <JobMapView jobs={jobs} />
              )}
            </>
          )}
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
