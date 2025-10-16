import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Home, Truck, TreePine, Hammer, PartyPopper, MoreHorizontal, Search } from "lucide-react";

const categories = [
  {
    name: "Cleaning",
    icon: Sparkles,
    path: "/services/cleaning",
    description: "House cleaning, office cleaning, deep cleaning services",
    featured: ["Maria's Cleaning", "SparkleClean Pro", "Fresh Home Services"],
  },
  {
    name: "Moving",
    icon: Truck,
    path: "/services/moving",
    description: "Local moving, packing services, furniture delivery",
    featured: ["Quick Movers", "Safe Transport Co.", "Dallas Moving Team"],
  },
  {
    name: "Landscaping",
    icon: TreePine,
    path: "/services/landscaping",
    description: "Lawn care, garden maintenance, tree trimming",
    featured: ["Green Thumb Landscaping", "Perfect Lawns", "Nature's Touch"],
  },
  {
    name: "Handyman",
    icon: Hammer,
    path: "/services/handyman",
    description: "Home repairs, installations, general maintenance",
    featured: ["Fix-It Fast", "Handy Home Services", "Pro Repairs"],
  },
  {
    name: "Events",
    icon: PartyPopper,
    path: "/services/events",
    description: "Event setup, catering, party planning services",
    featured: ["Party Perfect", "Event Magic", "Celebration Services"],
  },
  {
    name: "Other",
    icon: MoreHorizontal,
    path: "/services/other",
    description: "Pet care, tutoring, and miscellaneous services",
    featured: ["Pet Sitters Plus", "Home Tutors", "Task Helpers"],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Browse Services</h1>
            <p className="text-xl text-muted-foreground text-center mb-8">
              Find trusted local providers for any job
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for services or jobs..."
                className="pl-10 h-12"
              />
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-8">
              {categories.map((category) => (
                <Card key={category.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl mb-2">{category.name}</CardTitle>
                          <CardDescription className="text-base">{category.description}</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link to={category.path}>View Jobs</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="text-sm font-medium mb-2">Featured Providers:</p>
                      <div className="flex flex-wrap gap-2">
                        {category.featured.map((provider) => (
                          <span key={provider} className="text-sm px-3 py-1 bg-secondary rounded-full">
                            {provider}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Need a Service Provider?</h2>
            <p className="text-muted-foreground mb-6">
              Post your job and get competitive bids from local professionals
            </p>
            <Button size="lg" asChild>
              <Link to="/jobs/new">Post a Job Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
