import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AsyncResult } from "@/types";

export interface Review {
  id: string;
  listing_id: string;
  order_id: string;
  reviewer_id: string;
  rating: number;
  title: string | null;
  comment: string;
  verified_purchase: boolean;
  seller_response: string | null;
  seller_response_date: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export const useReviews = (listingId?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (listingId) {
      fetchListingReviews(listingId);
      checkUserCanReview(listingId);
    }
  }, [listingId]);

  const fetchListingReviews = async (id: string) => {
    try {
      setLoading(true);
      
      const { data: reviewsData, error } = await supabase
        .from("marketplace_reviews")
        .select("*")
        .eq("listing_id", id)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles separately
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", review.reviewer_id)
            .single();

          return {
            ...review,
            reviewer: profile || { full_name: null, avatar_url: null },
          };
        })
      );

      setReviews(reviewsWithProfiles as Review[]);
      calculateStats(reviewsWithProfiles as Review[]);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reseñas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
      return;
    }

    const total = reviewData.length;
    const sum = reviewData.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / total;

    const distribution = reviewData.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    setStats({
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: total,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, ...distribution },
    });
  };

  const checkUserCanReview = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanReview(false);
        return;
      }

      // Verificar si el usuario ha comprado este producto y no ha dejado review
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id")
        .eq("marketplace_listing_id", id)
        .eq("buyer_id", user.id)
        .eq("order_status", "completed");

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setCanReview(false);
        return;
      }

      // Verificar si ya dejó una review
      const { data: existingReview, error: reviewError } = await supabase
        .from("marketplace_reviews")
        .select("*")
        .eq("listing_id", id)
        .eq("reviewer_id", user.id)
        .maybeSingle();

      if (reviewError && reviewError.code !== 'PGRST116') throw reviewError;

      if (existingReview) {
        setUserReview(existingReview);
        setCanReview(false);
      } else {
        setCanReview(true);
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      setCanReview(false);
    }
  };

  const createReview = async (data: {
    listing_id: string;
    order_id: string;
    rating: number;
    title?: string;
    comment: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: review, error } = await supabase
        .from("marketplace_reviews")
        .insert({
          ...data,
          reviewer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Reseña publicada!",
        description: "Tu reseña ha sido publicada exitosamente",
      });

      // Refrescar reviews
      if (listingId) {
        await fetchListingReviews(listingId);
        await checkUserCanReview(listingId);
      }

      return { data: review, error: null };
    } catch (error: any) {
      console.error("Error creating review:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar la reseña",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const addSellerResponse = async (reviewId: string, response: string): Promise<AsyncResult> => {
    try {
      const { error } = await supabase
        .from("marketplace_reviews")
        .update({
          seller_response: response,
          seller_response_date: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo publicar la respuesta",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Respuesta publicada",
        description: "Tu respuesta ha sido publicada exitosamente",
      });

      if (listingId) {
        await fetchListingReviews(listingId);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error adding seller response:", error);
      toast({
        title: "Error",
        description: "No se pudo publicar la respuesta",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    reviews,
    stats,
    loading,
    canReview,
    userReview,
    createReview,
    addSellerResponse,
    refreshReviews: listingId ? () => fetchListingReviews(listingId) : undefined,
  };
};
