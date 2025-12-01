import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link2, ExternalLink, RefreshCw } from "lucide-react";

interface BlockchainNetwork {
  name: string;
  rpc_url: string;
  explorer: string;
  enabled: boolean;
}

interface BlockchainConfig {
  active: string;
  networks: {
    CRESTCHAIN: BlockchainNetwork;
    ORILUXCHAIN: BlockchainNetwork;
  };
}

export function BlockchainNetworkSwitch() {
  const [config, setConfig] = useState<BlockchainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'blockchain_network')
        .single();

      if (error) throw error;
      setConfig(data.value as BlockchainConfig);
    } catch (error: any) {
      console.error('Error fetching blockchain config:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de blockchain",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleNetworkSwitch = async (network: 'CRESTCHAIN' | 'ORILUXCHAIN') => {
    if (!config || config.active === network) return;

    try {
      setSwitching(true);
      
      const { data, error } = await supabase.rpc('set_active_blockchain', {
        _network: network
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar la red');
      }

      toast({
        title: "Red cambiada",
        description: result.message || `Ahora usando ${network}`,
      });

      // Actualizar estado local
      setConfig(prev => prev ? { ...prev, active: network } : null);
      
    } catch (error: any) {
      console.error('Error switching network:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar la red",
        variant: "destructive",
      });
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No se pudo cargar la configuración
        </CardContent>
      </Card>
    );
  }

  const isCrestChain = config.active === 'CRESTCHAIN';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Red Blockchain Activa
            </CardTitle>
            <CardDescription>
              Selecciona la blockchain para generar certificados NFT
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchConfig}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Switch */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className={`text-right transition-opacity ${isCrestChain ? 'opacity-50' : 'opacity-100'}`}>
              <p className="font-medium">OriluxChain</p>
              <p className="text-xs text-muted-foreground">Blockchain privada</p>
            </div>
            
            <Switch
              checked={isCrestChain}
              onCheckedChange={(checked) => handleNetworkSwitch(checked ? 'CRESTCHAIN' : 'ORILUXCHAIN')}
              disabled={switching}
              className="data-[state=checked]:bg-emerald-500"
            />
            
            <div className={`text-left transition-opacity ${isCrestChain ? 'opacity-100' : 'opacity-50'}`}>
              <p className="font-medium">CrestChain</p>
              <p className="text-xs text-muted-foreground">Blockchain pública</p>
            </div>
          </div>
          
          {switching && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        {/* Active Network Info */}
        <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              Red Activa
              <Badge variant={isCrestChain ? "default" : "secondary"}>
                {config.active}
              </Badge>
            </h4>
          </div>
          
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="font-medium">
                {config.networks[config.active as keyof typeof config.networks].name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RPC URL:</span>
              <span className="font-mono text-xs">
                {config.networks[config.active as keyof typeof config.networks].rpc_url}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Explorer:</span>
              <a 
                href={config.networks[config.active as keyof typeof config.networks].explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                Ver Explorer
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Networks Status */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(config.networks).map(([key, network]) => (
            <div 
              key={key}
              className={`p-3 rounded-lg border ${
                config.active === key 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{network.name}</span>
                <Badge variant={network.enabled ? "outline" : "secondary"} className="text-xs">
                  {network.enabled ? "Habilitada" : "Deshabilitada"}
                </Badge>
              </div>
              {config.active === key && (
                <Badge variant="default" className="text-xs">
                  En uso
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            <strong>Nota:</strong> Cambiar la red afectará todos los nuevos certificados generados. 
            Los certificados existentes mantienen su red original.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
