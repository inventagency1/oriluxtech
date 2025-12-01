import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface MarketplaceListing {
  id: string;
  jewelry_item_id: string;
  seller_id?: string; // Optional for public view
  price: number;
  currency: string;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  featured: boolean;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  review_count?: number;
  views?: number;
  likes?: number;
  // Public view fields
  seller_name?: string;
  seller_city?: string;
  seller_country?: string;
  jewelry_item: {
    id: string;
    name: string;
    type: string;
    materials: string[];
    weight?: number;
    dimensions?: string;
    origin?: string;
    craftsman?: string;
    images_count: number;
    user_id: string;
    main_image_url?: string | null;
    image_urls?: string[] | null;
    description?: string;
  };
  seller?: {
    full_name: string;
    business_name?: string;
    avatar_url?: string;
  };
  certificate?: {
    certificate_id: string;
    is_verified: boolean;
  };
}

export const useMarketplaceListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ UNA SOLA QUERY - Vista optimizada con todos los JOINs pre-hechos
      const { data, error: fetchError } = await supabase
        .from('marketplace_listings_complete')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // ✅ Mapear datos de la vista al formato esperado (sin queries adicionales)
      const mappedListings: MarketplaceListing[] = (data || []).map(item => ({
        id: item.id,
        jewelry_item_id: item.jewelry_item_id,
        seller_id: item.seller_id,
        price: item.price,
        currency: item.currency,
        description: item.description,
        status: item.status as 'active' | 'sold' | 'inactive',
        featured: item.featured,
        created_at: item.created_at,
        updated_at: item.updated_at,
        average_rating: item.average_rating,
        review_count: item.review_count,
        views: item.views,
        likes: item.likes,
        jewelry_item: {
          id: item.jewelry_item_id,
          name: item.jewelry_name,
          type: item.jewelry_type,
          materials: item.jewelry_materials || [],
          main_image_url: item.jewelry_main_image_url,
          image_urls: item.jewelry_image_urls,
          description: item.jewelry_description,
          weight: item.jewelry_weight,
          dimensions: item.jewelry_dimensions,
          origin: item.jewelry_origin,
          craftsman: item.jewelry_craftsman,
          images_count: item.jewelry_images_count,
          user_id: item.jewelry_user_id
        },
        seller: {
          full_name: item.seller_full_name || 'Vendedor',
          business_name: item.seller_business_name,
          avatar_url: item.seller_avatar_url
        },
        certificate: item.certificate_id ? {
          certificate_id: item.certificate_id,
          is_verified: item.certificate_is_verified || false
        } : undefined,
        // Public view fields for compatibility
        seller_name: item.seller_full_name,
        seller_city: item.seller_city,
        seller_country: item.seller_country
      }));

      setListings(mappedListings);
    } catch (error: any) {
      console.error('Error fetching marketplace listings:', error);
      setError('Error al cargar los listados del marketplace');
      toast.error('Error al cargar los listados del marketplace');
    } finally {
      setLoading(false);
    }
  };

  const createListing = async (listingData: {
    jewelry_item_id: string;
    price: number;
    currency: string;
    description: string;
    featured?: boolean;
  }) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un listado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert({
          jewelry_item_id: listingData.jewelry_item_id,
          seller_id: user.id,
          price: listingData.price,
          currency: listingData.currency,
          description: listingData.description,
          featured: listingData.featured || false,
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Listado creado exitosamente');
      await fetchListings();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating listing:', err);
      toast.error('Error al crear el listado');
      return { success: false, error: err };
    }
  };

  const updateListing = async (listingId: string, updates: Partial<MarketplaceListing>) => {
    if (!user) {
      toast.error('Debes iniciar sesión para actualizar un listado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      const { data, error: updateError } = await supabase
        .from('marketplace_listings')
        .update({
          price: updates.price,
          currency: updates.currency,
          description: updates.description,
          featured: updates.featured,
          status: updates.status
        })
        .eq('id', listingId)
        .eq('seller_id', user.id) // Ensure user owns the listing
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Listado actualizado exitosamente');
      await fetchListings();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating listing:', err);
      toast.error('Error al actualizar el listado');
      return { success: false, error: err };
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para eliminar un listado');
      return { success: false, error: 'Usuario no autenticado' };
    }

    try {
      // Soft delete: update deleted_at and deleted_by
      const { error: deleteError } = await supabase
        .from('marketplace_listings')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user.id 
        })
        .eq('id', listingId)
        .eq('seller_id', user.id); // Ensure user owns the listing

      if (deleteError) throw deleteError;

      toast.success('Listado eliminado exitosamente');
      await fetchListings();
      return { success: true };
    } catch (err) {
      console.error('Error deleting listing:', err);
      toast.error('Error al eliminar el listado');
      return { success: false, error: err };
    }
  };

  const getUserListings = (userId: string) => {
    return listings.filter(listing => listing.seller_id === userId);
  };

  const getSellerDisplayName = (listing: MarketplaceListing): string => {
    // For public view (no seller object)
    if (listing.seller_name) {
      return listing.seller_name;
    }
    // For authenticated view
    return listing.seller?.business_name || listing.seller?.full_name || 'Vendedor';
  };

  const getSellerLocation = (listing: MarketplaceListing): string | undefined => {
    if (listing.seller_city && listing.seller_country) {
      return `${listing.seller_city}, ${listing.seller_country}`;
    }
    if (listing.seller_city) {
      return listing.seller_city;
    }
    return undefined;
  };

  const getFeaturedListings = () => {
    return listings.filter(listing => listing.featured);
  };

  const searchListings = (searchTerm: string) => {
    if (!searchTerm) return listings;
    
    return listings.filter(listing =>
      listing.jewelry_item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.jewelry_item.materials.some(material =>
        material.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filterByCategory = (category: string) => {
    if (category === 'all') return listings;
    return listings.filter(listing => listing.jewelry_item.type === category);
  };

  const filterByPriceRange = (range: string) => {
    if (range === 'all') return listings;
    
    switch (range) {
      case 'low':
        return listings.filter(listing => listing.price < 1000000);
      case 'medium':
        return listings.filter(listing => listing.price >= 1000000 && listing.price < 3000000);
      case 'high':
        return listings.filter(listing => listing.price >= 3000000);
      default:
        return listings;
    }
  };

  const sortListings = (listings: MarketplaceListing[], sortBy: string) => {
    const sorted = [...listings];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'price_low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'featured':
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      default:
        return sorted;
    }
  };

  const getListingById = (listingId: string): MarketplaceListing | undefined => {
    return listings.find(listing => listing.id === listingId);
  };

  return {
    listings,
    loading,
    error,
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
    getUserListings,
    getFeaturedListings,
    searchListings,
    filterByCategory,
    filterByPriceRange,
    sortListings,
    getListingById,
    getSellerDisplayName,
    getSellerLocation
  };
};