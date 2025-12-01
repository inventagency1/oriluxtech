import { AppLayout } from "@/components/layout/AppLayout";
import { UserManagement as UserManagementComponent } from "@/components/admin/UserManagement";
import { JewelryApprovalPanel } from "@/components/admin/JewelryApprovalPanel";
import { RoleGuard } from "@/components/RoleGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const UserManagement = () => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_status', 'pending');
      setPendingCount(count || 0);
    };
    
    fetchPendingCount();
    
    // Subscribe to changes
    const channel = supabase
      .channel('pending-jewelry-accounts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles', filter: 'account_status=eq.pending' },
        () => fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AppLayout>
      <RoleGuard 
        requiredRole="admin" 
        showWarning 
        fallback={
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              Solo los administradores pueden acceder a esta página.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administra usuarios, roles y permisos del sistema
            </p>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="jewelry-approval">
                Aprobación de Joyerías
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <UserManagementComponent />
            </TabsContent>

            <TabsContent value="jewelry-approval" className="space-y-6">
              <JewelryApprovalPanel />
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </AppLayout>
  );
};

export default UserManagement;
