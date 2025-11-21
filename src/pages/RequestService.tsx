import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, Truck, TreePine, Hammer, PartyPopper, 
  MoreHorizontal, ArrowRight 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Sparkles,
  Truck,
  TreePine,
  Hammer,
  PartyPopper,
  MoreHorizontal,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  subcategories?: string[];
}

// TaskRabbit-style subcategories for each service type
const serviceSubcategories: Record<string, string[]> = {
  cleaning: [
    'General Cleaning',
    'Deep Cleaning',
    'Move In/Move Out Cleaning',
    'Post-Construction Cleaning',
    'Carpet Cleaning',
    'Window Cleaning',
  ],
  moving: [
    'Help Moving',
    'Heavy Lifting & Loading',
    'Packing Services',
    'Unpacking Services',
    'Furniture Rearranging',
    'Junk Removal',
  ],
  landscaping: [
    'Lawn Mowing',
    'Lawn Care',
    'Gardening',
    'Tree Trimming',
    'Landscape Design',
    'Yard Cleanup',
  ],
  handyman: [
    'Furniture Assembly',
    'TV Mounting',
    'Shelf Installation',
    'Minor Repairs',
    'Door & Lock Repair',
    'Drywall Repair',
  ],
  events: [
    'Event Setup',
    'Party Help',
    'Bartending',
    'Catering Help',
    'Event Cleanup',
    'Photography',
  ],
  other: [
    'Personal Assistant',
    'Delivery',
    'Errands',
    'Wait in Line',
    'Pet Care',
    'Organization',
  ],
};

export default function RequestService() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>(category || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        // Map database categories and add subcategories
        const categoriesWithSubs = data.map(cat => ({
          ...cat,
          subcategories: serviceSubcategories[cat.slug] || serviceSubcategories.other
        }));
        setCategories(categoriesWithSubs);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return MoreHorizontal;
    return iconMap[iconName] || MoreHorizontal;
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    navigate(`/request-service/${slug}`);
  };

  const handleSubcategoryClick = (subcategory: string, categorySlug: string) => {
    navigate(`/request-service/${categorySlug}/${encodeURIComponent(subcategory)}`);
  };

  const selectedCategoryData = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 text-gradient">
            What do you need help with?
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Select a category to get started with your service request
          </p>

          {/* Main Categories */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {categories.map((cat) => {
                const Icon = getIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 ${
                      selectedCategory === cat.slug
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className={`p-3 rounded-full transition-colors ${
                      selectedCategory === cat.slug ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        selectedCategory === cat.slug ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium text-center ${
                      selectedCategory === cat.slug ? 'text-primary' : 'text-foreground'
                    }`}>
                      {cat.name}
                    </span>
                    {selectedCategory === cat.slug && (
                      <div className="w-full h-1 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Subcategories */}
          {selectedCategoryData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground">
                  {selectedCategoryData.name} Services
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({selectedCategoryData.subcategories?.length || 0} options)
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategoryData.subcategories?.map((sub) => (
                  <Card
                    key={sub}
                    className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                    onClick={() => handleSubcategoryClick(sub, selectedCategoryData.slug)}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {sub}
                      </span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!selectedCategory && (
            <Card className="p-12 text-center gradient-subtle">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Choose a service category above</h3>
              <p className="text-muted-foreground">
                Select from our popular categories to find the perfect service provider
              </p>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
