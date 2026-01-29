import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Award, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderCard from "@/components/providers/ProviderCard";

export default function TopProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchTopProviders();
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchTopProviders = async () => {
    setLoading(true);
    
    // Get provider user IDs
    const { data: providerRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'provider');
    
    if (!providerRoles || providerRoles.length === 0) {
      setProviders([]);
      setLoading(false);
      return;
    }
    
    const providerIds = providerRoles.map(r => r.user_id);
    
    // Get providers with their settings and skills
    const { data } = await supabase
      .from('profiles')
      .select(`
        *,
        provider_settings (*),
        provider_skills (skill_name, years_experience, verified),
        provider_badges (badge_type, issued_at)
      `)
      .in('id', providerIds);
    
    if (data) {
      let filteredData = data;
      
      // Filter by category if selected
      if (selectedCategory && selectedCategory !== 'all') {
        const category = categories.find(c => c.id === selectedCategory);
        if (category) {
          filteredData = filteredData.filter(provider => 
            provider.provider_skills?.some((skill: any) => 
              skill.skill_name.toLowerCase().includes(category.name.toLowerCase()) ||
              category.name.toLowerCase().includes(skill.skill_name.toLowerCase())
            )
          );
        }
      }
      
      // Get ratings and completed jobs for each provider
      const providersWithStats = await Promise.all(
        filteredData.map(async (provider) => {
          // Get reviews and ratings
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewed_id', provider.id);
          
          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          
          // Get completed jobs count
          const { data: completedJobs, count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('awarded_provider_id', provider.id)
            .eq('status', 'completed');
          
          // Count badges
          const badgeCount = provider.provider_badges?.length || 0;
          
          // Calculate trust score (weighted: rating 50%, jobs 30%, badges 20%)
          const trustScore = (avgRating / 5) * 50 + 
                            Math.min((count || 0) / 50, 1) * 30 + 
                            Math.min(badgeCount / 5, 1) * 20;
          
          return {
            ...provider,
            avgRating,
            reviewCount: reviews?.length || 0,
            completedJobsCount: count || 0,
            badgeCount,
            trustScore
          };
        })
      );

      // Sort by trust score (highest first) and filter out providers with no ratings
      const topProviders = providersWithStats
        .filter(p => p.avgRating >= 4.0 || p.completedJobsCount >= 5)
        .sort((a, b) => b.trustScore - a.trustScore);

      setProviders(topProviders);
    }
    setLoading(false);
  };

  const filteredProviders = providers.filter(provider =>
    provider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.provider_settings?.bio_headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-center">
                Top Rated Professionals
              </h1>
            </div>
            <p className="text-xl text-muted-foreground text-center mb-8">
              Curated directory of highly-rated, verified service providers with proven track records
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Star className="h-4 w-4 mr-2 fill-primary text-primary" />
                4.0+ Rating Required
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                Verified Reviews
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Award className="h-4 w-4 mr-2 text-primary" />
                Badge Certified
              </Badge>
            </div>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or skills..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex justify-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Providers Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {filteredProviders.length} top-rated {filteredProviders.length === 1 ? 'provider' : 'providers'}
              </p>
              <p className="text-sm text-muted-foreground">
                Sorted by trust score
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No top providers found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider, index) => (
                  <div key={provider.id} className="relative">
                    {index < 3 && (
                      <Badge className="absolute -top-2 -right-2 z-10 gradient-primary">
                        #{index + 1} Top Pro
                      </Badge>
                    )}
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
