import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplaceListings } from "@/hooks/useMarketplaceListings";
import { MyListings } from "./MyListings";
import { 
  ShoppingBag, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Star,
  BarChart3,
  ExternalLink,
  Target
} from "lucide-react";

export const JoyeroMarketplacePanel = () => {
  const { user } = useAuth();
  const { listings, getUserListings } = useMarketplaceListings();
  
  const myListings = user ? getUserListings(user.id) : [];
  
  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');
  const featuredListings = myListings.filter(l => l.featured);
  
  const totalValue = activeListings.reduce((sum, listing) => sum + listing.price, 0);
  const soldValue = soldListings.reduce((sum, listing) => sum + listing.price, 0);
  
  const formatPrice = (price: number, currency: string = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6" />
            <span>Mi Marketplace</span>
          </h2>
          <p className="text-muted-foreground">
            Gestiona tus ventas y productos en el marketplace
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to="/marketplace">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Marketplace
            </Link>
          </Button>
          <Button className="bg-gradient-gold text-background hover:scale-105 transition-transform" asChild>
            <Link to="/crear-listado">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Listado
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Listados</p>
                <p className="text-2xl font-bold">{myListings.length}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {activeListings.length} activos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor en Venta</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(totalValue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {activeListings.length} productos activos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendido</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(soldValue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {soldListings.length} productos vendidos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Destacados</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {featuredListings.length}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Productos promocionados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {myListings.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Empieza a vender!</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer listado en el marketplace y comienza a vender tus joyas certificadas
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-gradient-gold text-background hover:scale-105 transition-transform" asChild>
                <Link to="/crear-listado">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Listado
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/marketplace">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorar Marketplace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {myListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Rendimiento</span>
            </CardTitle>
            <CardDescription>
              Análisis de tus listados en el marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {myListings.length > 0 ? Math.round((soldListings.length / myListings.length) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {myListings.length > 0 ? formatPrice(totalValue + soldValue / myListings.length) : formatPrice(0)}
                </div>
                <p className="text-sm text-muted-foreground">Precio Promedio</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {featuredListings.length}
                </div>
                <p className="text-sm text-muted-foreground">Productos Destacados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Listings */}
      <MyListings showHeader={false} limit={5} />

      {/* Tips for Sellers */}
      <Card className="bg-gradient-to-r from-gold/5 to-gold-light/5 border-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gold" />
            <span>Consejos para Vender Mejor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📸 Fotografías de Calidad</h4>
              <p className="text-sm text-muted-foreground">
                Usa imágenes claras y bien iluminadas para mostrar los detalles de tus joyas
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✨ Productos Destacados</h4>
              <p className="text-sm text-muted-foreground">
                Marca tus mejores productos como destacados para mayor visibilidad
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">📝 Descripciones Detalladas</h4>
              <p className="text-sm text-muted-foreground">
                Incluye información sobre materiales, procedencia y características únicas
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🏆 Certificación NFT</h4>
              <p className="text-sm text-muted-foreground">
                Los productos con certificados NFT generan más confianza en los compradores
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};