import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Home, Truck, TreePine, Hammer, PartyPopper, MoreHorizontal, CheckCircle, MessageCircle, Star } from "lucide-react";

const categories = [
  { name: "Cleaning", icon: Sparkles, path: "/services/cleaning" },
  { name: "Moving", icon: Truck, path: "/services/moving" },
  { name: "Landscaping", icon: TreePine, path: "/services/landscaping" },
  { name: "Handyman", icon: Hammer, path: "/services/handyman" },
  { name: "Events", icon: PartyPopper, path: "/services/events" },
  { name: "Other", icon: MoreHorizontal, path: "/services/other" },
];

const steps = [
  {
    icon: MessageCircle,
    title: "Post Your Job",
    description: "Describe what you need done and set your budget",
  },
  {
    icon: CheckCircle,
    title: "Review Bids",
    description: "Compare proposals from local providers",
  },
  {
    icon: Star,
    title: "Get It Done",
    description: "Hire the best provider and pay when complete",
  },
];

const testimonials = [
  {
    name: "Maria Rodriguez",
    role: "Customer",
    text: "Found an amazing cleaner in minutes! The bidding process made it easy to find someone within my budget.",
  },
  {
    name: "John Smith",
    role: "Provider",
    text: "Service HUB has helped me grow my handyman business. I get consistent work from local customers.",
  },
  {
    name: "Sarah Chen",
    role: "Customer",
    text: "The platform made moving so much easier. Got multiple quotes and chose the perfect moving company.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Local Help for Any Task
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with trusted service providers in Texas. Post a job, get bids, and hire the perfect person for the job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/jobs/new">Post a Job</Link>
              </Button>
              <Button size="lg" variant="accent" asChild>
                <Link to="/auth/signup">Join as Provider</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.name} to={category.path}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <category.icon className="h-12 w-12 mb-3 text-primary" />
                      <h3 className="font-semibold">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <step.icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" asChild>
                <Link to="/how-it-works">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{testimonial.name}</CardTitle>
                    <CardDescription>{testimonial.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
