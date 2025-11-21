import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, List, Map } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import { AdvancedFilters } from '@/components/jobs/AdvancedFilters';
import { JobMapView } from '@/components/jobs/JobMapView';
import { LocationSearch } from '@/components/jobs/LocationSearch';
import { useAdvancedSearch, SearchFilters } from '@/hooks/useAdvancedSearch';
import { analytics } from '@/utils/analytics';

export default function Jobs() {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'recent',
    datePosted: 'all',
    radius: 25
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { jobs, loading } = useAdvancedSearch(filters);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    analytics.trackSearch(value, filters);
  };

  const handleLocationChange = (location: string, coords?: { lat: number; lng: number }) => {
    setFilters(prev => ({ ...prev, location, locationCoords: coords }));
  };

  const handleRadiusChange = (radius: number) => {
    setFilters(prev => ({ ...prev, radius }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Browse Jobs</h1>
            <p className="text-muted-foreground">Find your next opportunity in Texas</p>
          </div>
          <Link to="/jobs/new">
            <Button className="gradient-primary shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar with Location & Filters */}
          <div className="space-y-6">
            <LocationSearch
              value={filters.location || ''}
              radius={filters.radius || 25}
              onLocationChange={handleLocationChange}
              onRadiusChange={handleRadiusChange}
            />
            <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or description..."
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
                    className={viewMode === 'list' ? 'gradient-primary' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('map')}
                    title="Map View"
                    className={viewMode === 'map' ? 'gradient-primary' : ''}
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="p-12 text-center gradient-subtle">
                <p className="text-muted-foreground font-semibold">No jobs found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your location or filters</p>
              </Card>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-foreground">
                        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                        {filters.location && filters.radius && filters.radius > 0 && (
                          <span className="text-muted-foreground ml-2">
                            within {filters.radius} miles
                          </span>
                        )}
                      </div>
                    </div>
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <JobMapView 
                    jobs={jobs} 
                    center={filters.locationCoords}
                  />
                )}
              </>
            )}
          </div>
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
