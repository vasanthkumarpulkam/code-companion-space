import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderCard from "@/components/providers/ProviderCard";

export default function Providers() {
  const [searchParams] = useSearchParams();
  const serviceParam = searchParams.get('service'); // From wizard redirect
  const skillParam = searchParams.get('skill'); // From other links
  
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Set category from service parameter on mount
  useEffect(() => {
    if (serviceParam && categories.length > 0) {
      const category = categories.find(c => c.slug === serviceParam);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [serviceParam, categories]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProviders();
    }
  }, [selectedCategory, availableOnly, skillParam, serviceParam, categories]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    
    // First get all provider user IDs from user_roles
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
    
    // Get all providers with their settings
    let query = supabase
      .from('profiles')
      .select(`
        *,
        provider_settings (*),
        provider_skills (skill_name, years_experience, verified)
      `)
      .in('id', providerIds);

    if (availableOnly) {
      query = query.eq('provider_settings.available_now', true);
    }

    const { data } = await query;
    
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
      
      // Filter by skill if skill parameter is provided
      if (skillParam) {
        filteredData = filteredData.filter(provider => 
          provider.provider_skills?.some((skill: any) => 
            skill.skill_name.toLowerCase().includes(skillParam.toLowerCase())
          )
        );
      }
      
      // Get average ratings for each provider
      const providersWithRatings = await Promise.all(
        filteredData.map(async (provider) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('reviewed_id', provider.id);
          
          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          
          return {
            ...provider,
            avgRating,
            reviewCount: reviews?.length || 0
          };
        })
      );

      setProviders(providersWithRatings);
    }
    setLoading(false);
  };

  const filteredProviders = providers.filter(provider =>
    provider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.provider_settings?.bio_headline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDisplayCategory = () => {
    if (serviceParam) {
      const category = categories.find(c => c.slug === serviceParam);
      return category?.name || serviceParam;
    }
    return skillParam || 'Service';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              {(serviceParam || skillParam) 
                ? `Find ${getDisplayCategory()} Professionals` 
                : 'Find Trusted Professionals'}
            </h1>
            <p className="text-xl text-muted-foreground text-center mb-8">
              {(serviceParam || skillParam)
                ? `Browse skilled ${getDisplayCategory().toLowerCase()} providers ready to help with your next project`
                : 'Browse skilled providers ready to help with your next project'
              }
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, skills, or location..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant={availableOnly ? "default" : "outline"}
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Available Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Providers Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found
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
                <p className="text-muted-foreground text-lg mb-4">No providers found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
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