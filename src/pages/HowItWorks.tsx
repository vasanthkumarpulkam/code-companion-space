import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { UserCircle, Briefcase, MessageCircle, DollarSign, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  const customerSteps = [
    {
      icon: MessageCircle,
      title: t('howItWorks.customers.step1'),
      description: t('howItWorks.customers.step1Desc'),
    },
    {
      icon: UserCircle,
      title: t('howItWorks.customers.step2'),
      description: t('howItWorks.customers.step2Desc'),
    },
    {
      icon: DollarSign,
      title: t('howItWorks.customers.step3'),
      description: t('howItWorks.customers.step3Desc'),
    },
    {
      icon: Star,
      title: t('howItWorks.customers.step4'),
      description: t('howItWorks.customers.step4Desc'),
    },
  ];

  const providerSteps = [
    {
      icon: Briefcase,
      title: t('howItWorks.providers.step1'),
      description: t('howItWorks.providers.step1Desc'),
    },
    {
      icon: MessageCircle,
      title: t('howItWorks.providers.step2'),
      description: t('howItWorks.providers.step2Desc'),
    },
    {
      icon: UserCircle,
      title: t('howItWorks.providers.step3'),
      description: t('howItWorks.providers.step3Desc'),
    },
    {
      icon: Star,
      title: t('howItWorks.providers.step4'),
      description: t('howItWorks.providers.step4Desc'),
    },
  ];

  const faqs = [
    {
      question: t('howItWorks.faq.q1'),
      answer: t('howItWorks.faq.a1'),
    },
    {
      question: t('howItWorks.faq.q2'),
      answer: t('howItWorks.faq.a2'),
    },
    {
      question: t('howItWorks.faq.q3'),
      answer: t('howItWorks.faq.a3'),
    },
    {
      question: t('howItWorks.faq.q4'),
      answer: t('howItWorks.faq.a4'),
    },
    {
      question: t('howItWorks.faq.q5'),
      answer: t('howItWorks.faq.a5'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('howItWorks.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('howItWorks.subtitle')}
            </p>
          </div>
        </section>

        {/* For Customers */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">{t('howItWorks.customers.title')}</h2>
              <p className="text-muted-foreground">{t('howItWorks.customers.subtitle')}</p>
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
                <Link to="/jobs/new">{t('howItWorks.customers.cta')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Providers */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">{t('howItWorks.providers.title')}</h2>
              <p className="text-muted-foreground">{t('howItWorks.providers.subtitle')}</p>
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
                <Link to="/auth/signup">{t('howItWorks.providers.cta')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorks.faq.title')}</h2>
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
