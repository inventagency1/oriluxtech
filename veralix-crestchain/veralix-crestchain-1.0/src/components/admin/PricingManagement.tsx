import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingStats } from "./pricing/PricingStats";
import { PackagePricingSection } from "./pricing/PackagePricingSection";
import { IndividualPricingSection } from "./pricing/IndividualPricingSection";
import { useCertificatePackages } from "@/hooks/useCertificatePackages";
import { supabase } from "@/integrations/supabase/client";

export function PricingManagement() {
  const { packages, fetchPackages } = useCertificatePackages();
  const [pricingRulesCount, setPricingRulesCount] = useState({ total: 0, active: 0 });

  useEffect(() => {
    fetchPackages(true);
    fetchPricingRulesCount();
  }, [fetchPackages]);

  const fetchPricingRulesCount = async () => {
    try {
      const { data, error } = await supabase
        .from('certificate_pricing')
        .select('id, is_active');

      if (error) throw error;
      
      setPricingRulesCount({
        total: data?.length || 0,
        active: data?.filter(r => r.is_active).length || 0
      });
    } catch (error) {
      console.error('Error fetching pricing rules count:', error);
    }
  };

  const activePackages = packages.filter(p => p.is_active).length;

  return (
    <div className="space-y-6">
      <PricingStats
        totalPackages={packages.length}
        totalRules={pricingRulesCount.total}
        activePackages={activePackages}
        activeRules={pricingRulesCount.active}
      />

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Paquetes de Certificados</TabsTrigger>
          <TabsTrigger value="individual">Precios por Tipo de Joya</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages" className="mt-6">
          <PackagePricingSection />
        </TabsContent>
        
        <TabsContent value="individual" className="mt-6">
          <IndividualPricingSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
