import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { UserCircle, Briefcase, MessageCircle, DollarSign, Star } from "lucide-react";

const customerSteps = [
  {
    icon: MessageCircle,
    title: "1. Post Your Job",
    description: "Create a detailed job posting with photos, budget, and location. Our system automatically translates to Spanish.",
  },
  {
    icon: UserCircle,
    title: "2. Review Provider Bids",
    description: "Receive private bids from local providers. Compare prices, reviews, and proposals to find the perfect match.",
  },
  {
    icon: DollarSign,
    title: "3. Hire & Pay",
    description: "Award the job to your chosen provider. Pay in cash when the work is complete. The platform fee is automatically collected.",
  },
  {
    icon: Star,
    title: "4. Leave a Review",
    description: "Rate your experience and help other customers find great providers.",
  },
];

const providerSteps = [
  {
    icon: Briefcase,
    title: "1. Create Your Profile",
    description: "Showcase your skills, add portfolio photos, and set your service area. Build trust with potential customers.",
  },
  {
    icon: MessageCircle,
    title: "2. Browse Jobs & Bid",
    description: "Find jobs that match your skills. Submit competitive bids with detailed proposals to win work.",
  },
  {
    icon: UserCircle,
    title: "3. Get Hired",
    description: "Communicate with customers, confirm details, and complete the job to their satisfaction.",
  },
  {
    icon: Star,
    title: "4. Build Reputation",
    description: "Collect 5-star reviews and grow your business through the platform.",
  },
];

const faqs = [
  {
    question: "How does the payment system work?",
    answer: "Customers pay providers directly in cash when the job is completed. The platform automatically collects a 10% fee from both parties through saved payment methods.",
  },
  {
    question: "What categories are available?",
    answer: "We support Cleaning, Moving, Landscaping, Handyman services, Events, and Other miscellaneous services across Texas.",
  },
  {
    question: "Is there a fee to use Service HUB?",
    answer: "Posting jobs and browsing providers is free. We charge a 10% platform fee from both customers and providers only when a job is successfully completed.",
  },
  {
    question: "How are providers verified?",
    answer: "Providers create detailed profiles with their skills and portfolio. They build reputation through customer reviews and ratings visible on their public profiles.",
  },
  {
    question: "Can I message providers before hiring?",
    answer: "Yes! Our in-app messaging system allows you to communicate with providers, ask questions, and clarify details before making a decision.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Service HUB Works</h1>
            <p className="text-xl text-muted-foreground">
              A simple platform connecting customers with trusted local service providers
            </p>
          </div>
        </section>

        {/* For Customers */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">For Customers</h2>
              <p className="text-muted-foreground">Get your tasks done by local professionals</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {customerSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <Link to="/jobs/new">Post Your First Job</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Providers */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">For Service Providers</h2>
              <p className="text-muted-foreground">Grow your business with local customers</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {providerSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground shrink-0">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="mb-2">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button size="lg" variant="accent" asChild>
                <Link to="/auth/signup">Join as Provider</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
