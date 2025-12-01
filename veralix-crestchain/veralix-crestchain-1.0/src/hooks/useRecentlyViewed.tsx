import { supabase } from "@/integrations/supabase/client";

export const useRecentlyViewed = () => {
  const trackView = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('recently_viewed').upsert({
        user_id: user.id,
        listing_id: listingId,
        viewed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,listing_id'
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getRecentlyViewed = async (limit = 5) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select(`
          listing_id,
          marketplace_listings (
            *,
            jewelry_item:jewelry_items(*),
            seller:profiles(*)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      return [];
    }
  };

  return { trackView, getRecentlyViewed };
};
