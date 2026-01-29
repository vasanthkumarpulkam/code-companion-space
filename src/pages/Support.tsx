import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Mail, HelpCircle } from "lucide-react";

const helpCategories = [
  {
    title: "Getting Started",
    articles: [
      "How to create an account",
      "Setting up your profile",
      "Understanding the platform fees",
      "Payment methods and security",
    ],
  },
  {
    title: "For Customers",
    articles: [
      "How to post a job",
      "Reviewing and comparing bids",
      "Awarding a job to a provider",
      "Payment process and receipts",
    ],
  },
  {
    title: "For Providers",
    articles: [
      "Finding jobs that match your skills",
      "Submitting competitive bids",
      "Building your profile and portfolio",
      "Getting more 5-star reviews",
    ],
  },
  {
    title: "Safety & Trust",
    articles: [
      "Verifying provider credentials",
      "Reporting inappropriate content",
      "Dispute resolution process",
      "Privacy and data protection",
    ],
  },
];

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you a reset link. Follow the instructions in the email to create a new password.",
  },
  {
    question: "When is the platform fee charged?",
    answer: "The 10% platform fee is automatically charged to both the customer and provider only after the job is marked as completed by both parties. The fee is collected from your saved payment method.",
  },
  {
    question: "How can I delete my account?",
    answer: "Go to Settings > Account > Delete Account. Please note that this action is permanent and will remove all your data, including job history and reviews.",
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer: "If you're unsatisfied with the work, first communicate with the provider to resolve the issue. If that doesn't work, contact our support team through the help center, and we'll assist with dispute resolution.",
  },
  {
    question: "How do I change my language preference?",
    answer: "Go to Settings > Preferences > Language and select either English or Spanish. Your job postings will be automatically translated to help you reach more providers.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pl-10 h-12"
              />
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">Browse Help Topics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <a
                            href="#"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 bg-muted/50">
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

        {/* Contact Form */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-2">Still Need Help?</h2>
              <p className="text-muted-foreground">Send us a message and we'll get back to you within 24 hours</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or question..."
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
