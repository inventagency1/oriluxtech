import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchCertificateCreation } from "@/components/certificates/BatchCertificateCreation";
import { CertificateHistory } from "@/components/certificates/CertificateHistory";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Shield, History, Package } from "lucide-react";

const CertificateManagement = () => {
  const [activeTab, setActiveTab] = useState("batch");
  const { autoCompleteTask } = useOnboarding();

  useEffect(() => {
    // Auto-complete the onboarding task when user views certificate management
    autoCompleteTask('first-certificate');
  }, []);

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-heading flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <span>Gestión de Certificados NFT</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra y crea certificados NFT para tus joyas
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch" className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Creación Masiva</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batch" className="mt-6">
            <BatchCertificateCreation />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <CertificateHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CertificateManagement;
