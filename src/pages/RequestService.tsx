import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wrench, Drill, Truck, Sparkles, Trees, Hammer, 
  Paintbrush, Flame, ArrowRight 
} from 'lucide-react';

const mainCategories = [
  { id: 'assembly', name: 'Assembly', icon: Wrench, color: 'from-blue-50 to-blue-100' },
  { id: 'mounting', name: 'Mounting', icon: Drill, color: 'from-teal-50 to-teal-100' },
  { id: 'moving', name: 'Moving', icon: Truck, color: 'from-green-50 to-green-100' },
  { id: 'cleaning', name: 'Cleaning', icon: Sparkles, color: 'from-purple-50 to-purple-100' },
  { id: 'outdoor', name: 'Outdoor Help', icon: Trees, color: 'from-emerald-50 to-emerald-100' },
  { id: 'repairs', name: 'Home Repairs', icon: Hammer, color: 'from-orange-50 to-orange-100' },
  { id: 'painting', name: 'Painting', icon: Paintbrush, color: 'from-pink-50 to-pink-100' },
  { id: 'trending', name: 'Trending', icon: Flame, color: 'from-red-50 to-red-100' },
];

const subcategories: Record<string, string[]> = {
  assembly: ['General Furniture Assembly', 'IKEA Assembly', 'Crib Assembly', 'Bookshelf Assembly', 'Desk Assembly'],
  mounting: ['Hang Art, Mirror & Decor', 'Install Blinds & Window Treatments', 'Mount & Anchor Furniture', 'Install Shelves, Rods & Hooks', 'Other Mounting', 'TV Mounting'],
  moving: ['Help Moving', 'Flat-Rate Move by Dolly™', 'Trash & Furniture Removal', 'Heavy Lifting & Loading', 'Rearrange Furniture', 'Junk Haul Away'],
  cleaning: ['Cleaning', 'Spring Cleaning', 'Apartment Cleaning', 'Deep Clean', 'Garage Cleaning', 'Move Out Clean'],
  outdoor: ['Lawn Mowing', 'Gardening', 'Tree Trimming', 'Pressure Washing', 'Landscaping Design'],
  repairs: ['Plumbing', 'Electrical', 'Carpentry', 'Drywall Repair', 'Door Repair'],
  painting: ['Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Touch-Up Paint'],
  trending: ['Smart Home Setup', 'Furniture Refinishing', 'Wallpaper Installation', 'Holiday Decorating'],
};

export default function RequestService() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleSubcategoryClick = (subcategory: string) => {
    navigate(`/request-service/${selectedCategory}/${encodeURIComponent(subcategory)}`);
  };

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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
            {mainCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedCategory === cat.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className={`p-3 rounded-full bg-gradient-to-br ${cat.color}`}>
                  <cat.icon className={`h-6 w-6 ${selectedCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-sm font-medium text-center ${
                  selectedCategory === cat.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {cat.name}
                </span>
                {selectedCategory === cat.id && (
                  <div className="w-full h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Subcategories */}
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">
                  Select a specific service for {mainCategories.find(c => c.id === selectedCategory)?.name}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories[selectedCategory]?.map((sub) => (
                  <Card
                    key={sub}
                    className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
                    onClick={() => handleSubcategoryClick(sub)}
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
