import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Gift } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAirdrop } from "@/hooks/useAirdrop";

export function TokenBalance() {
  const { user } = useAuth();
  const { getUserTokenBalance, getUserAirdropClaims } = useAirdrop();
  const [balance, setBalance] = useState(0);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTokenData();
    }
  }, [user]);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      const [tokenBalance, airdropClaims] = await Promise.all([
        getUserTokenBalance(),
        getUserAirdropClaims()
      ]);
      
      setBalance(tokenBalance);
      setClaims(airdropClaims);
    } catch (error) {
      console.error('Error loading token data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="hover:shadow-premium transition-premium">
        <CardContent className="pt-6">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEarned = claims.reduce((sum, claim) => sum + (claim.token_amount || 0), 0);
  const recentClaims = claims.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Token Balance Card */}
      <Card className="hover:shadow-gold transition-premium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance de Tokens VRX</CardTitle>
          <Coins className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total ganado: {totalEarned.toLocaleString()} VRX
          </p>
        </CardContent>
      </Card>

      {/* Recent Claims */}
      {claims.length > 0 && (
        <Card className="hover:shadow-crypto transition-premium">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              Airdrops Recientes
            </CardTitle>
            <CardDescription>
              Últimos tokens recibidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm">{claim.airdrops?.title || 'Airdrop'}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(claim.claimed_at).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  +{claim.token_amount} VRX
                </Badge>
              </div>
            ))}
            
            {claims.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Y {claims.length - 3} airdrops más...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Claims State */}
      {claims.length === 0 && balance === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <CardTitle className="text-sm mb-2">Sin tokens aún</CardTitle>
            <CardDescription className="text-xs">
              Participarás en futuros airdrops automáticamente
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}