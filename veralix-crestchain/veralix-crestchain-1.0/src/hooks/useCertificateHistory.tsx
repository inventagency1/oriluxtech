import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CertificateHistoryItem {
  id: string;
  certificate_id: string;
  jewelry_item_id: string;
  user_id: string;
  is_verified: boolean;
  created_at: string;
  verification_date: string | null;
  transaction_hash: string | null;
  blockchain_network: string;
  certificate_pdf_url: string | null;
  verification_url: string | null;
  qr_code_url: string | null;
  jewelry_items: {
    name: string;
    type: string;
    materials: string[];
    sale_price: number | null;
    currency: string;
    main_image_url: string | null;
    images_count: number;
  };
  transfers_count?: number;
  last_transfer?: string | null;
}

export interface CertificateStats {
  total: number;
  verified: number;
  pending: number;
  transferred: number;
  totalValue: number;
  averageValue: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
}

export const useCertificateHistory = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateHistoryItem[]>([]);
  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    verified: 0,
    pending: 0,
    transferred: 0,
    totalValue: 0,
    averageValue: 0,
    byType: {},
    byMonth: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCertificateHistory();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadCertificateHistory = async () => {
    try {
      setIsLoading(true);

      // Fetch certificates with jewelry data
      const { data: certsData, error: certsError } = await supabase
        .from('nft_certificates')
        .select(`
          *,
          jewelry_items (
            name,
            type,
            materials,
            sale_price,
            currency,
            main_image_url,
            images_count
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (certsError) throw certsError;

      // Fetch transfer counts for each certificate
      const certificatesWithTransfers = await Promise.all(
        (certsData || []).map(async (cert) => {
          const { data: transfers, error: transfersError } = await supabase
            .from('certificate_transfers')
            .select('created_at')
            .eq('certificate_id', cert.id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (transfersError) {
            console.error('Error fetching transfers:', transfersError);
            return {
              ...cert,
              transfers_count: 0,
              last_transfer: null
            };
          }

          return {
            ...cert,
            transfers_count: transfers?.length || 0,
            last_transfer: transfers?.[0]?.created_at || null
          };
        })
      );

      setCertificates(certificatesWithTransfers);
      calculateStats(certificatesWithTransfers);
    } catch (error) {
      console.error('Error loading certificate history:', error);
      toast.error('Error al cargar el historial de certificados');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (certs: CertificateHistoryItem[]) => {
    const total = certs.length;
    const verified = certs.filter(c => c.is_verified).length;
    const pending = certs.filter(c => !c.is_verified).length;
    const transferred = certs.filter(c => (c.transfers_count || 0) > 0).length;

    const totalValue = certs.reduce((sum, c) => {
      return sum + (c.jewelry_items?.sale_price || 0);
    }, 0);

    const averageValue = total > 0 ? totalValue / total : 0;

    // Group by type
    const byType: Record<string, number> = {};
    certs.forEach(cert => {
      const type = cert.jewelry_items?.type || 'Sin tipo';
      byType[type] = (byType[type] || 0) + 1;
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    certs.forEach(cert => {
      const month = new Date(cert.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short'
      });
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    setStats({
      total,
      verified,
      pending,
      transferred,
      totalValue,
      averageValue,
      byType,
      byMonth
    });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('certificate_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nft_certificates',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          loadCertificateHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    certificates,
    stats,
    isLoading,
    reload: loadCertificateHistory
  };
};
