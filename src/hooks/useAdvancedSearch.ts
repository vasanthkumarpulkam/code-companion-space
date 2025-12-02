import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  query?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  locationCoords?: { lat: number; lng: number };
  radius?: number; // in miles
  datePosted?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'recent' | 'budget_high' | 'budget_low' | 'nearest';
}

export function useAdvancedSearch(filters: SearchFilters) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchJobs();
  }, [JSON.stringify(filters)]);

  const searchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select(`
        *,
        categories(name, icon),
        profiles!jobs_customer_id_fkey(full_name, avatar_url)
      `)
      .eq('status', 'open');

    // Full-text search using tsvector
    if (filters.query) {
      query = query.textSearch('search_vector', filters.query, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Category filter
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }

    // Budget range filter
    if (filters.minBudget !== undefined) {
      query = query.gte('budget', filters.minBudget);
    }
    if (filters.maxBudget !== undefined) {
      query = query.lte('budget', filters.maxBudget);
    }

    // Date posted filter
    if (filters.datePosted && filters.datePosted !== 'all') {
      const now = new Date();
      let dateThreshold = new Date();
      
      switch (filters.datePosted) {
        case 'today':
          dateThreshold.setHours(0, 0, 0, 0);
          break;
        case 'week':
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateThreshold.setMonth(now.getMonth() - 1);
          break;
      }
      
      query = query.gte('created_at', dateThreshold.toISOString());
    }

    // Location filter with radius-based search
    if (filters.location) {
      if (filters.locationCoords && filters.radius && filters.radius > 0) {
        // Use PostGIS for radius-based search (requires location_lat and location_lng)
        // For now, filter by text and we'll do distance calculation client-side
        query = query.not('location_lat', 'is', null).not('location_lng', 'is', null);
      } else {
        // Simple text-based location filter
        query = query.ilike('location', `%${filters.location}%`);
      }
    }

    // Sorting
    switch (filters.sortBy) {
      case 'budget_high':
        query = query.order('budget', { ascending: false });
        break;
      case 'budget_low':
        query = query.order('budget', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredJobs = data;

      // Client-side radius filtering if coordinates provided
      if (filters.locationCoords && filters.radius && filters.radius > 0) {
        filteredJobs = data.filter((job: any) => {
          if (!job.location_lat || !job.location_lng) return false;
          
          const distance = calculateDistance(
            filters.locationCoords!.lat,
            filters.locationCoords!.lng,
            job.location_lat,
            job.location_lng
          );
          
          return distance <= filters.radius!;
        });
      }

      setJobs(filteredJobs);
    }

    setLoading(false);
  };

  return { jobs, loading, refetch: searchJobs };
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
