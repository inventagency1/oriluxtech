import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryDashboard } from './categories/CategoryDashboard';
import { ClientManagementTab } from './categories/ClientManagementTab';
import { CategoryPricingTab } from './categories/CategoryPricingTab';
import { CategoryBenefitsTab } from './categories/CategoryBenefitsTab';
import { BarChart3, Users, DollarSign, Gift } from 'lucide-react';

export function CategoryManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Categorías de Clientes</h2>
        <p className="text-muted-foreground">
          Administra categorías, precios personalizados y beneficios por nivel de cliente
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Precios
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Beneficios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <CategoryDashboard />
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagementTab />
        </TabsContent>

        <TabsContent value="pricing">
          <CategoryPricingTab />
        </TabsContent>

        <TabsContent value="benefits">
          <CategoryBenefitsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}