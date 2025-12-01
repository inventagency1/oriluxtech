import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HomepageStats {
  // Marketplace stats (Index page)
  totalValue: number;
  certificateCount: number;
  formattedValue: string;
  formattedCount: string;
  // About page stats
  jewelryStores: number;
  nftsGenerated: number;
  formattedStores: string;
  formattedNfts: string;
  // Metadata
  lastUpdated: Date;
}

const formatValue = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

const formatCount = (count: number): string => {
  if (count >= 100) return `${count}+`;
  return count.toString();
};

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
  if (num >= 100) return `${num}+`;
  return num.toString();
};

export const useHomepageStats = () => {
  return useQuery({
    queryKey: ["homepage-stats"],
    queryFn: async (): Promise<HomepageStats> => {
      // Get certificate count and total value (for Index page)
      const { data: certificates, error: certError } = await supabase
        .from("nft_certificates")
        .select(`
          id,
          jewelry_item_id,
          is_verified
        `)
        .eq("is_verified", true);

      if (certError) throw certError;

      const certificateCount = certificates?.length || 0;

      // Get jewelry items to calculate total value
      const jewelryIds = certificates?.map(cert => cert.jewelry_item_id) || [];
      
      let totalValue = 0;
      if (jewelryIds.length > 0) {
        const { data: jewelry, error: jewelryError } = await supabase
          .from("jewelry_items")
          .select("sale_price")
          .in("id", jewelryIds);

        if (jewelryError) throw jewelryError;

        totalValue = jewelry?.reduce((sum, item) => {
          return sum + (Number(item.sale_price) || 0);
        }, 0) || 0;
      }

      // Contar joyerías (profiles con business_name) - for About page
      const { count: storesCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .not("business_name", "is", null);

      const jewelryStores = storesCount || 0;

      return {
        totalValue,
        certificateCount,
        formattedValue: formatValue(totalValue),
        formattedCount: formatCount(certificateCount),
        jewelryStores,
        nftsGenerated: certificateCount,
        formattedStores: formatNumber(jewelryStores),
        formattedNfts: formatNumber(certificateCount),
        lastUpdated: new Date(),
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refetch every 1 minute
    placeholderData: {
      totalValue: 1400000000,
      certificateCount: 16,
      formattedValue: "$1.4B",
      formattedCount: "16",
      jewelryStores: 1,
      nftsGenerated: 16,
      formattedStores: "1",
      formattedNfts: "16",
      lastUpdated: new Date(),
    },
  });
};
