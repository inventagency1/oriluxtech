import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { JoyeroMarketplacePanel } from "@/components/marketplace/JoyeroMarketplacePanel";
import { ShoppingBag } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const MyMarketplace = () => {
  const { user } = useAuth();
  const { isJoyero } = useUserRole();

  // Access Control
  if (!user || !isJoyero) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
            <p className="text-muted-foreground mb-6">
              Solo las joyerías pueden acceder al panel de gestión del marketplace
            </p>
            <div className="flex space-x-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/marketplace">Ver Marketplace</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-heading mb-2">Mi Marketplace</h1>
          <p className="text-muted-foreground">
            Gestiona tus listados, órdenes y ventas
          </p>
        </div>
        
        <JoyeroMarketplacePanel />
      </div>
    </AppLayout>
  );
};

export default MyMarketplace;