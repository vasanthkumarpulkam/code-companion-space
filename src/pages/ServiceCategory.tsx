import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MapPin, DollarSign, Calendar, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import JobCard from "@/components/jobs/JobCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceCategory() {
  const { category } = useParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState("");
  const [budgetRange, setBudgetRange] = useState([0, 1000]);
  const [datePosted, setDatePosted] = useState<string>("any");
  const [sortBy, setSortBy] = useState("recent");

  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1) || "";

  useEffect(() => {
    fetchCategoryId();
  }, [category]);

  useEffect(() => {
    if (categoryId) {
      fetchJobs();
    }
  }, [categoryId, locationFilter, budgetRange, datePosted, sortBy]);

  const fetchCategoryId = async () => {
    if (!category) return;
    
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();
    
    if (data) {
      setCategoryId(data.id);
    }
  };

  const fetchJobs = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select(`
        *,
        category:categories(name, icon),
        customer:profiles!jobs_customer_id_fkey(full_name, avatar_url)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'open');

    // Location filter
    if (locationFilter.trim()) {
      query = query.ilike('location', `%${locationFilter}%`);
    }

    // Budget range filter
    query = query.gte('budget', budgetRange[0]).lte('budget', budgetRange[1]);

    // Date posted filter
    if (datePosted !== 'any') {
      const now = new Date();
      let dateThreshold = new Date();
      
      if (datePosted === 'today') {
        dateThreshold.setHours(0, 0, 0, 0);
      } else if (datePosted === 'week') {
        dateThreshold.setDate(now.getDate() - 7);
      } else if (datePosted === 'month') {
        dateThreshold.setMonth(now.getMonth() - 1);
      }
      
      query = query.gte('created_at', dateThreshold.toISOString());
    }

    // Sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'budget-high') {
      query = query.order('budget', { ascending: false });
    } else if (sortBy === 'budget-low') {
      query = query.order('budget', { ascending: true });
    }

    const { data } = await query;
    
    if (data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const handleClearFilters = () => {
    setLocationFilter("");
    setBudgetRange([0, 1000]);
    setDatePosted("any");
    setSortBy("recent");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="py-6 px-4 border-b">
          <div className="container mx-auto">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/services">Services</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{categoryName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* Header */}
        <section className="py-8 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{categoryName} Services</h1>
                <p className="text-muted-foreground">Browse available jobs and post your own</p>
              </div>
              <Button size="lg" asChild>
                <Link to="/jobs/new">Post a Job</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Location */}
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="City, ZIP" 
                          className="pl-9"
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <div className="pt-2">
                        <Slider 
                          value={budgetRange} 
                          onValueChange={setBudgetRange}
                          max={1000} 
                          step={10}
                          minStepsBetweenThumbs={1}
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>${budgetRange[0]}</span>
                          <span>${budgetRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date Posted */}
                    <div className="space-y-2">
                      <Label>Date Posted</Label>
                      <Select value={datePosted} onValueChange={setDatePosted}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This week</SelectItem>
                          <SelectItem value="month">This month</SelectItem>
                          <SelectItem value="any">Any time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </aside>

              {/* Job Listings */}
              <div className="lg:col-span-3 space-y-6">
                {/* Sort and Results */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {loading ? "Loading..." : `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} found`}
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                      <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Cards */}
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground text-lg mb-4">No jobs found in this category</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your filters or be the first to post a job
                      </p>
                      <Button asChild>
                        <Link to="/jobs/new">Post a Job</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
