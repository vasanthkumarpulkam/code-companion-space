import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Truck, TreePine, Hammer, PartyPopper, MoreHorizontal } from 'lucide-react';

const iconMap: Record<string, any> = {
  Sparkles,
  Truck,
  TreePine,
  Hammer,
  PartyPopper,
  MoreHorizontal,
};

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId: string | undefined) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return MoreHorizontal;
    return iconMap[iconName] || MoreHorizontal;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!selectedCategory ? 'default' : 'outline'}
        className="cursor-pointer px-4 py-2"
        onClick={() => onCategoryChange(undefined)}
      >
        All Categories
      </Badge>
      {categories.map((category) => {
        const Icon = getIcon(category.icon);
        return (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2 flex items-center gap-2"
            onClick={() => onCategoryChange(category.id)}
          >
            <Icon className="h-3 w-3" />
            {category.name}
          </Badge>
        );
      })}
    </div>
  );
}