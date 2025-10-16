import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Home, Truck, TreePine, Hammer, PartyPopper, MoreHorizontal, CheckCircle, MessageCircle, Star, Search, Shield, Clock, Users, TrendingUp, ArrowRight, Award, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { name: "category.cleaning", icon: Sparkles, path: "/services/cleaning" },
  { name: "category.moving", icon: Truck, path: "/services/moving" },
  { name: "category.landscaping", icon: TreePine, path: "/services/landscaping" },
  { name: "category.handyman", icon: Hammer, path: "/services/handyman" },
  { name: "category.events", icon: PartyPopper, path: "/services/events" },
  { name: "category.other", icon: MoreHorizontal, path: "/services/other" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setServiceCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = serviceCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, serviceCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const steps = [
    {
      icon: MessageCircle,
      title: t('landing.howItWorks.step1'),
      description: t('landing.howItWorks.step1Desc'),
    },
    {
      icon: CheckCircle,
      title: t('landing.howItWorks.step2'),
      description: t('landing.howItWorks.step2Desc'),
    },
    {
      icon: Star,
      title: t('landing.howItWorks.step3'),
      description: t('landing.howItWorks.step3Desc'),
    },
  ];

  const testimonials = [
    {
      name: "Maria Rodriguez",
      role: t('landing.testimonials.customer'),
      text: t('testimonial1.text'),
      rating: 5,
    },
    {
      name: "John Smith",
      role: t('landing.testimonials.provider'),
      text: t('testimonial2.text'),
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: t('landing.testimonials.customer'),
      text: t('testimonial3.text'),
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, label: t('landing.stats.activeProviders'), value: "10,000+" },
    { icon: CheckCircle, label: t('landing.stats.jobsCompleted'), value: "50,000+" },
    { icon: Star, label: t('landing.stats.avgRating'), value: "4.8/5" },
    { icon: Clock, label: t('landing.stats.avgResponse'), value: "< 2 hours" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (zipcode.trim()) params.append('zipcode', zipcode);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleSuggestionClick = (categoryName: string) => {
    setSearchQuery(categoryName);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('landing.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('landing.hero.subtitle')}
              </p>
              
              {/* Search Bar with Suggestions and Zipcode */}
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Service Search with Dropdown */}
                  <div ref={searchRef} className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="What service do you need? (e.g., house cleaning, moving help...)"
                      className="pl-12 pr-4 h-14 text-base shadow-lg border-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery && setShowSuggestions(true)}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-background border-2 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                        {filteredSuggestions.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleSuggestionClick(category.name)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-3"
                          >
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Zipcode Search */}
                  <div className="relative md:w-48">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Zipcode"
                      className="pl-12 pr-4 h-14 text-base shadow-lg border-2"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      maxLength={5}
                    />
                  </div>

                  {/* Search Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 px-8 shadow-lg"
                  >
                    Search
                  </Button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="shadow-lg">
                  <Link to="/jobs/new">{t('landing.hero.postJob')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="shadow-lg">
                  <Link to="/providers">Find Providers</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild className="shadow-lg">
                  <Link to="/auth/signup">{t('landing.hero.joinProvider')}</Link>
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-card border shadow-sm">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.categories.title')}</h2>
              <p className="text-muted-foreground">{t('landing.categories.subtitle')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link key={category.name} to={category.path}>
                  <Card className="hover:shadow-xl hover:scale-105 hover:border-primary/50 transition-all duration-300 cursor-pointer h-full group">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base">{t(category.name)}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <Link to="/services">
                  {t('landing.categories.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.howItWorks.title')}</h2>
              <p className="text-muted-foreground">{t('landing.howItWorks.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                  <div className="flex justify-center mb-6 relative z-10">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
                      <step.icon className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link to="/how-it-works">
                  {t('landing.howItWorks.learnMore')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.testimonials.title')}</h2>
              <p className="text-muted-foreground">{t('landing.testimonials.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <CardDescription className="text-xs">{testimonial.role}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-8 md:p-12 text-center text-primary-foreground shadow-2xl">
              <Award className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cta.title')}</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                {t('landing.cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="shadow-lg">
                  <Link to="/jobs/new">{t('landing.cta.postJob')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/30 shadow-lg">
                  <Link to="/auth/signup">{t('landing.cta.becomeProvider')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
