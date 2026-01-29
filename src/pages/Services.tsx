import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import JobCard from "@/components/jobs/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Services() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchJobs();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select(`
        *,
        categories(name, icon),
        profiles!jobs_customer_id_fkey(full_name, avatar_url)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (selectedCategory !== "all") {
      query = query.eq('category_id', selectedCategory);
    }

    const { data } = await query;
    
    if (data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">{t('services.title')}</h1>
            <p className="text-xl text-muted-foreground text-center mb-8">
              {t('services.subtitle')}
            </p>
            
            {/* Search and Filter Bar */}
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('services.search')}
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder={t('services.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('services.allCategories')}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs Listing */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {!loading && filteredJobs.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {t('services.showing')} {filteredJobs.length} {t('services.openJobs')} {filteredJobs.length === 1 ? t('services.job') : t('services.jobs')}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">{t('services.noJobs')}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'all' 
                    ? t('services.adjustFilters')
                    : t('services.beFirst')}
                </p>
                <Button asChild>
                  <Link to="/jobs/new">{t('services.postJob')}</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">{t('services.cta.title')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('services.cta.subtitle')}
            </p>
            <Button size="lg" asChild>
              <Link to="/jobs/new">{t('services.cta.button')}</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
