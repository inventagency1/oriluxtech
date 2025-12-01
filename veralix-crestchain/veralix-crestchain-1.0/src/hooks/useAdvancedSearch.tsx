import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  types?: string[];
  materials?: string[];
  minRating?: number;
  sellerId?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'trending' | 'category' | 'material';
  count?: number;
}

interface SearchResult {
  id: string;
  jewelry_item_id: string;
  seller_id: string;
  price: number;
  currency: string;
  description: string | null;
  status: string;
  featured: boolean;
  views: number;
  likes: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  relevance: number;
}

const RECENT_SEARCHES_KEY = 'veralix_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const useAdvancedSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance'
  });
  const { user } = useAuth();

  // Get recent searches from localStorage
  const getRecentSearches = (): SearchSuggestion[] => {
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      return recent.map((text: string) => ({ text, type: 'recent' as const }));
    } catch {
      return [];
    }
  };

  // Save search to recent searches
  const saveRecentSearch = (query: string) => {
    if (!query || query.trim().length < 2) return;
    
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      const updated = [
        query,
        ...recent.filter((s: string) => s !== query)
      ].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setSuggestions([]);
  };

  // Get suggestions based on query
  const getSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions(getRecentSearches());
      return;
    }

    const allSuggestions: SearchSuggestion[] = [];

    // Add matching categories
    const categories = [
      'anillo', 'collar', 'pulsera', 'aretes', 'reloj', 
      'cadena', 'pendiente', 'dije', 'brazalete'
    ];
    const matchingCategories = categories
      .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
      .map(cat => ({ text: cat, type: 'category' as const }));
    allSuggestions.push(...matchingCategories);

    // Add matching materials
    const materials = [
      'oro', 'plata', 'platino', 'diamante', 'esmeralda', 
      'rubí', 'zafiro', 'perla', 'acero', 'titanio'
    ];
    const matchingMaterials = materials
      .filter(mat => mat.toLowerCase().includes(query.toLowerCase()))
      .map(mat => ({ text: mat, type: 'material' as const }));
    allSuggestions.push(...matchingMaterials);

    setSuggestions(allSuggestions);
  };

  // Perform search
  const search = async (searchFilters: SearchFilters) => {
    setLoading(true);
    setFilters(searchFilters);

    try {
      const { data, error } = await supabase.rpc('search_marketplace_listings', {
        search_query: searchFilters.query || null,
        min_price: searchFilters.minPrice || null,
        max_price: searchFilters.maxPrice || null,
        jewelry_types: searchFilters.types || null,
        materials: searchFilters.materials || null,
        min_rating: searchFilters.minRating || null,
        filter_seller_id: searchFilters.sellerId || null,
        sort_by: searchFilters.sortBy || 'relevance'
      });

      if (error) throw error;

      setResults(data || []);
      
      // Save search query to recent
      if (searchFilters.query) {
        saveRecentSearch(searchFilters.query);
      }

      // Track search analytics
      if (user && searchFilters.query) {
        await supabase.from('search_analytics').insert([{
          user_id: user.id,
          search_query: searchFilters.query,
          filters_applied: searchFilters as any,
          results_count: data?.length || 0
        }]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Error al realizar la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Track clicked result
  const trackClick = async (resultId: string) => {
    if (!user || !filters.query) return;

    try {
      // Insert a new analytics record with the clicked result
      await supabase.from('search_analytics').insert([{
        user_id: user.id,
        search_query: filters.query,
        filters_applied: filters as any,
        clicked_result_id: resultId,
        results_count: results.length
      }]);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  return {
    results,
    suggestions,
    loading,
    filters,
    setFilters,
    search,
    getSuggestions,
    clearRecentSearches,
    trackClick
  };
};
