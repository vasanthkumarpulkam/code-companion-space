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

const mockJobs = [
  {
    id: "1",
    title: "Deep house cleaning needed",
    description: "Need a thorough deep clean of 3-bedroom house including kitchen and bathrooms",
    budget: 150,
    location: "Austin, TX",
    posted: "2 hours ago",
    bids: 5,
  },
  {
    id: "2",
    title: "Weekly office cleaning",
    description: "Looking for reliable weekly cleaning service for small office space",
    budget: 100,
    location: "Dallas, TX",
    posted: "1 day ago",
    bids: 8,
  },
  {
    id: "3",
    title: "Move-out cleaning",
    description: "Apartment needs to be spotless for final inspection",
    budget: 200,
    location: "Houston, TX",
    posted: "3 days ago",
    bids: 12,
  },
];

export default function ServiceCategory() {
  const { category } = useParams();
  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1) || "";

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
                        <Input placeholder="City, ZIP" className="pl-9" />
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <div className="pt-2">
                        <Slider defaultValue={[50, 500]} max={1000} step={10} />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>$50</span>
                          <span>$500</span>
                        </div>
                      </div>
                    </div>

                    {/* Date Posted */}
                    <div className="space-y-2">
                      <Label>Date Posted</Label>
                      <Select>
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

                    {/* Provider Rating */}
                    <div className="space-y-2">
                      <Label>Minimum Rating</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 stars</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="3">3+ stars</SelectItem>
                          <SelectItem value="any">Any rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full">Clear Filters</Button>
                  </CardContent>
                </Card>
              </aside>

              {/* Job Listings */}
              <div className="lg:col-span-3 space-y-6">
                {/* Sort and Results */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-muted-foreground">{mockJobs.length} jobs found</p>
                  <Select defaultValue="recent">
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                      <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                      <SelectItem value="bids">Most Bids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Cards */}
                {mockJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="mb-2">{job.title}</CardTitle>
                          <CardDescription>{job.description}</CardDescription>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-lg font-bold text-accent">
                            <DollarSign className="h-5 w-5" />
                            {job.budget}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {job.posted}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {job.bids} bids
                        </div>
                      </div>
                      <Button asChild>
                        <Link to={`/jobs/${job.id}`}>View Details & Bid</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" disabled>Previous</Button>
                  <Button variant="outline">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
