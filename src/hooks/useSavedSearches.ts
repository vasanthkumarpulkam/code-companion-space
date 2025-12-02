import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    query?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    location?: string;
    sortBy?: string;
  };
  created_at: string;
}

export function useSavedSearches() {
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedSearches();
    }
  }, [user]);

  const fetchSavedSearches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches((data || []).map(item => ({
        ...item,
        filters: item.filters as SavedSearch['filters'],
      })));
    } catch (error: any) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async (name: string, filters: SavedSearch['filters']) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          filters,
        })
        .select()
        .single();

      if (error) throw error;

      const savedSearch: SavedSearch = {
        ...data,
        filters: data.filters as SavedSearch['filters'],
      };
      setSavedSearches(prev => [savedSearch, ...prev]);
      toast({ title: 'Search saved successfully!' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to save search',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedSearches(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Search deleted' });
      return true;
    } catch (error: any) {
      toast({
        title: 'Failed to delete search',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    savedSearches,
    loading,
    saveSearch,
    deleteSearch,
    refetch: fetchSavedSearches,
  };
}
