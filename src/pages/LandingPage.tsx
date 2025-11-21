import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Home, Truck, TreePine, Hammer, PartyPopper, MoreHorizontal, CheckCircle, MessageCircle, Star, Search, Shield, Clock, Users, TrendingUp, ArrowRight, Award, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { name: "category.cleaning", icon: Sparkles, path: "/request-service/cleaning" },
  { name: "category.moving", icon: Truck, path: "/request-service/moving" },
  { name: "category.landscaping", icon: TreePine, path: "/request-service/landscaping" },
  { name: "category.handyman", icon: Hammer, path: "/request-service/handyman" },
  { name: "category.events", icon: PartyPopper, path: "/request-service/events" },
  { name: "category.other", icon: MoreHorizontal, path: "/request-service/other" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { userRole } = useAuth();
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
      <Header hideBackButton />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 lg:py-32 px-4 overflow-hidden">
          {/* Background with gradient and pattern */}
          <div className="absolute inset-0 gradient-subtle"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(263 85% 58%) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight px-2">
                Your local service marketplace with <span className="text-gradient">3 ways to hire</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto px-4">
                Post jobs for quotes, browse top-rated pros, or negotiate directly—flexibility you won't find anywhere else.
              </p>
            </div>

            {/* Three Customer Options - USP Cards */}
            <div className={`grid grid-cols-1 ${userRole === 'provider' ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3 md:gap-4 max-w-4xl mx-auto mb-8 md:mb-10 px-4`}>
              {/* Option 1: Post & Get Quotes - Hidden for providers */}
              {userRole !== 'provider' && (
                <Card className="border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group bg-card/50 backdrop-blur-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader className="pb-2 relative z-10">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold">Post Job, Get Quotes</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      Receive multiple competitive quotes from nearby providers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 relative z-10">
                    <Button asChild className="w-full gradient-primary h-9 text-sm font-medium shadow-sm">
                      <Link to="/jobs/new">Post a Job</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Option 2: Browse Top Providers */}
              <Card className="border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group bg-card/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base font-semibold">Browse Top Pros</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Hire highly-rated professionals from our curated directory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 relative z-10">
                  <Button asChild variant="outline" className="w-full border h-9 text-sm font-medium hover:bg-accent/10">
                    <Link to="/top-providers">View Providers</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Option 3: Negotiate Pricing */}
              <Card className="border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group bg-card/50 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="pb-2 relative z-10">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base font-semibold">Flexible Pricing</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Negotiate rates and choose the best offer for your budget.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3 relative z-10">
                  <Button asChild variant="secondary" className="w-full h-9 text-sm font-medium shadow-sm">
                    <Link to="/providers">Search Providers</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-6 md:mb-8 px-4">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <div ref={searchRef} className="relative flex-1">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="What service do you need?"
                      className="pl-10 md:pl-12 pr-4 h-12 md:h-14 text-sm md:text-base shadow-lg border-2"
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
                            className="w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-accent transition-colors flex items-center gap-2 md:gap-3"
                          >
                            <Search className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                            <span className="font-medium text-sm md:text-base">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative sm:w-40 md:w-48">
                    <MapPin className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Zipcode"
                      className="pl-10 md:pl-12 pr-4 h-12 md:h-14 text-sm md:text-base shadow-lg border-2"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 md:h-14 px-6 md:px-8 shadow-lg text-sm md:text-base">
                    Search
                  </Button>
                </div>
              </form>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 md:mt-12 text-center px-4">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Trusted by <span className="font-bold text-foreground">50,000+</span> people • <span className="font-bold text-foreground">4.8/5</span> with over <span className="font-bold text-foreground">10,000</span> reviews
              </p>
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-10 md:py-16 lg:py-20 px-4 bg-card border-y">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-foreground">Popular services near you</h2>
            
            {/* Category Tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 hide-scrollbar">
              {[
                { name: 'Cleaning', icon: Sparkles, slug: 'cleaning' },
                { name: 'Handyman', icon: Hammer, slug: 'handyman' },
                { name: 'Moving', icon: Truck, slug: 'moving' },
                { name: 'Landscaping', icon: TreePine, slug: 'landscaping' },
                { name: 'Events', icon: PartyPopper, slug: 'events' },
                { name: 'Other', icon: MoreHorizontal, slug: 'other' },
              ].map((category, index) => (
                <Link
                  key={category.name}
                  to={`/request-service/${category.slug}`}
                  className={`flex flex-col items-center gap-2 p-4 min-w-[110px] rounded-xl transition-all ${
                    index === 0 
                      ? 'bg-card shadow-lg border-2 border-primary' 
                      : 'bg-card/50 hover:bg-card hover:shadow-md border-2 border-border hover:border-primary/30'
                  }`}
                >
                  <category.icon className={`h-8 w-8 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium text-center whitespace-nowrap">{category.name}</span>
                </Link>
              ))}
            </div>

            {/* Service Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                'Furniture Assembly',
                'TV Mounting',
                'Shelf Installation',
                'Deep Cleaning',
                'Move In/Move Out Cleaning',
                'Lawn Mowing',
              ].map((service) => (
                <Link
                  key={service}
                  to={`/request-service/${service.toLowerCase().includes('clean') ? 'cleaning' : service.toLowerCase().includes('lawn') ? 'landscaping' : 'handyman'}/${encodeURIComponent(service)}`}
                  className="px-6 py-2.5 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all text-sm font-medium whitespace-nowrap"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Services You Might Like */}
        <section className="py-10 md:py-16 lg:py-20 px-4 gradient-subtle">
          <div className="container mx-auto max-w-7xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8">Services you might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((category) => (
                <Link key={category.name} to={category.path}>
                  <div className="text-center p-4 rounded-xl hover:bg-card hover:shadow-lg border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                    <category.icon className="h-10 w-10 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-xs md:text-sm font-medium">{t(category.name)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cost Estimates Section */}
        <section className="py-16 md:py-20 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get free cost estimates</h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                We analyzed millions of bids from Service HUB professionals to see what things really cost. Find out what other people have paid for projects like yours.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { service: 'Furniture Assembly', price: 'Projects starting at $49', category: 'handyman', gradient: 'from-orange-100 to-orange-200', icon: Hammer },
                { service: 'Shelf Installation', price: 'Projects starting at $65', category: 'handyman', gradient: 'from-blue-100 to-blue-200', icon: Hammer },
                { service: 'Deep Cleaning', price: 'Projects starting at $49', category: 'cleaning', gradient: 'from-green-100 to-green-200', icon: Sparkles },
                { service: 'Minor Repairs', price: 'Projects starting at $74', category: 'handyman', gradient: 'from-purple-100 to-purple-200', icon: Hammer },
                { service: 'TV Mounting', price: 'Projects starting at $69', category: 'handyman', gradient: 'from-yellow-100 to-yellow-200', icon: Hammer },
                { service: 'Help Moving', price: 'Projects starting at $80', category: 'moving', gradient: 'from-red-100 to-red-200', icon: Truck },
                { service: 'Lawn Mowing', price: 'Projects starting at $200', category: 'landscaping', gradient: 'from-emerald-100 to-emerald-200', icon: TreePine },
                { service: 'Event Setup', price: 'Projects starting at $150', category: 'events', gradient: 'from-pink-100 to-pink-200', icon: PartyPopper },
              ].map((item) => (
                <Link
                  key={item.service}
                  to={`/request-service/${item.category}/${encodeURIComponent(item.service)}`}
                  className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Placeholder with Gradient */}
                  <div className={`h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <item.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 bg-card">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.service}</h3>
                    <p className="text-sm text-muted-foreground">{item.price}</p>
                  </div>
                </Link>
              ))}
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
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 gradient-primary opacity-30" />
                  )}
                  <div className="flex justify-center mb-6 relative z-10">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                      <step.icon className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="bg-card border-2 rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-primary/20 transition-all">
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

        {/* Real User Testimonials */}
        <section className="py-16 md:py-20 px-4 gradient-subtle">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">These reviews say it better</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Pamela",
                  text: "We found so many people on Service HUB. And some of the people we found, like our electrician, we use him now. He's great."
                },
                {
                  name: "Terrence", 
                  text: "I didn't realize how many professionals Service HUB had on it. You type in things like 'house cleaning,' you get a ton of pros. You name it. It's there."
                },
                {
                  name: "Lawrence",
                  text: "Service HUB is a place that I would recommend real people to go. If you need to have your sink done, replaced, go to Service HUB."
                }
              ].map((testimonial, index) => (
                <Card key={index} className="border-2 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all bg-card">
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-base leading-relaxed mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold">-{testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="py-12 px-4 gradient-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <stat.icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                  <p className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 gradient-subtle"></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(263 85% 58%) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
          
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Consider it done.</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Whatever you need, we'll connect you with the right professional to get it done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gradient-primary border-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 text-lg px-8 h-14 transition-all">
                <Link to="/jobs/new">Post a Job</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="shadow-md border-2 hover:border-primary/50 hover:bg-primary/5 text-lg px-8 h-14 transition-all">
                <Link to="/providers">Find Providers</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
