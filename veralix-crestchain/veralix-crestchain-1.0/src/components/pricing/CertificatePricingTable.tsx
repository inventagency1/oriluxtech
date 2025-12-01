import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gem, Sparkles, Crown, Coins } from "lucide-react";

interface PricingData {
  type: string;
  label: string;
  icon: any;
  min_price?: number;
  price?: number;
  final_price?: number;
  currency: string;
  discount_percentage?: number;
  category?: string;
}

interface CertificatePricingTableProps {
  publicPrices?: Record<string, { min_price: number; currency: string }>;
  personalizedPrices?: Record<string, any>;
  isAuthenticated: boolean;
  loading?: boolean;
}

export const CertificatePricingTable = ({
  publicPrices = {},
  personalizedPrices = {},
  isAuthenticated,
  loading = false
}: CertificatePricingTableProps) => {
  const jewelryTypes: PricingData[] = [
    { type: 'anillo', label: 'Anillo', icon: Gem, currency: 'COP' },
    { type: 'collar', label: 'Collar', icon: Sparkles, currency: 'COP' },
    { type: 'pulsera', label: 'Pulsera', icon: Crown, currency: 'COP' },
    { type: 'aretes', label: 'Aretes', icon: Coins, currency: 'COP' }
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryBadge = (category?: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      regular: { label: 'Regular', variant: 'secondary' },
      premium: { label: 'Premium', variant: 'default' },
      vip: { label: 'VIP', variant: 'default' }
    };
    return badges[category || 'regular'];
  };

  return (
    <Card className="shadow-premium border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-heading">
          {isAuthenticated ? 'Tus Precios Personalizados' : 'Precios Base de Certificación'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(publicPrices).length === 0 && Object.keys(personalizedPrices).length === 0 && !loading && (
          <div className="text-center py-4 text-muted-foreground">
            No hay precios disponibles en este momento.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {jewelryTypes.map((item) => {
            const IconComponent = item.icon;
            const publicData = publicPrices[item.type];
            const personalData = personalizedPrices[item.type];

            return (
              <div
                key={item.type}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    {isAuthenticated && personalData?.category && (
                      <Badge 
                        variant={getCategoryBadge(personalData.category).variant}
                        className="text-xs mt-1"
                      >
                        {getCategoryBadge(personalData.category).label}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {loading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : isAuthenticated && personalData ? (
                    <div>
                      {personalData.discount_percentage > 0 && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(personalData.price, personalData.currency)}
                        </p>
                      )}
                      <p className="text-lg font-bold text-foreground">
                        {formatPrice(personalData.final_price, personalData.currency)}
                      </p>
                      {personalData.discount_percentage > 0 && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          -{personalData.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                  ) : publicData ? (
                    <p className="text-lg font-semibold text-muted-foreground">
                      desde {formatPrice(publicData.min_price, publicData.currency)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Consultar</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
