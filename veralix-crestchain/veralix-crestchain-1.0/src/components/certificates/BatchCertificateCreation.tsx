import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Package,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface JewelryItem {
  id: string;
  name: string;
  type: string;
  status: string;
  hasCertificate: boolean;
}

interface BatchCertificateCreationProps {
  onComplete?: () => void;
}

export const BatchCertificateCreation = ({ onComplete }: BatchCertificateCreationProps) => {
  const { user } = useAuth();
  const [jewelryItems, setJewelryItems] = useState<JewelryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    success: string[];
    failed: string[];
  }>({ success: [], failed: [] });

  useEffect(() => {
    fetchJewelryItems();
  }, [user]);

  const fetchJewelryItems = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch jewelry items
      const { data: items, error: itemsError } = await supabase
        .from('jewelry_items')
        .select('id, name, type, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      // Check which items already have certificates
      const { data: certificates, error: certError } = await supabase
        .from('nft_certificates')
        .select('jewelry_item_id')
        .in('jewelry_item_id', (items || []).map(i => i.id));

      if (certError) throw certError;

      const certifiedIds = new Set(certificates?.map(c => c.jewelry_item_id) || []);

      const itemsWithCertStatus = (items || []).map(item => ({
        ...item,
        hasCertificate: certifiedIds.has(item.id)
      }));

      setJewelryItems(itemsWithCertStatus);
    } catch (error) {
      console.error('Error fetching jewelry items:', error);
      toast.error('Error al cargar las joyas');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAll = () => {
    const eligibleItems = jewelryItems.filter(item => !item.hasCertificate);
    if (selectedItems.size === eligibleItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(eligibleItems.map(item => item.id)));
    }
  };

  const processBatch = async () => {
    if (selectedItems.size === 0) {
      toast.error('Selecciona al menos una joya para certificar');
      return;
    }

    setProcessing(true);
    setProgress(0);
    const success: string[] = [];
    const failed: string[] = [];

    const itemsArray = Array.from(selectedItems);
    
    for (let i = 0; i < itemsArray.length; i++) {
      const jewelryItemId = itemsArray[i];
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-nft-certificate', {
          body: {
            jewelryItemId,
            userId: user?.id
          }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Error generando certificado');
        }

        success.push(jewelryItemId);
        toast.success(`Certificado generado para ${jewelryItems.find(j => j.id === jewelryItemId)?.name}`);
      } catch (error) {
        console.error(`Error generating certificate for ${jewelryItemId}:`, error);
        failed.push(jewelryItemId);
        toast.error(`Error certificando ${jewelryItems.find(j => j.id === jewelryItemId)?.name}`);
      }

      // Update progress
      setProgress(Math.round(((i + 1) / itemsArray.length) * 100));
      
      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setResults({ success, failed });
    setProcessing(false);
    
    // Refresh jewelry items
    await fetchJewelryItems();
    
    // Clear selection
    setSelectedItems(new Set());

    if (onComplete) {
      onComplete();
    }

    // Show summary
    toast.success(
      `Proceso completado: ${success.length} certificados generados${failed.length > 0 ? `, ${failed.length} fallidos` : ''}`
    );
  };

  const eligibleItems = jewelryItems.filter(item => !item.hasCertificate);
  const certifiedItems = jewelryItems.filter(item => item.hasCertificate);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Creación Masiva de Certificados</span>
            </CardTitle>
            <CardDescription>
              Genera múltiples certificados NFT de una sola vez
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {eligibleItems.length} sin certificar
            </Badge>
            <Badge variant="secondary">
              {certifiedItems.length} certificadas
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Processing state */}
        {processing && (
          <Alert>
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Generando certificados...</p>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {progress}% completado ({selectedItems.size} certificados)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {!processing && (results.success.length > 0 || results.failed.length > 0) && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                {results.success.length > 0 && (
                  <p className="text-sm">
                    <strong className="text-green-600">
                      ✓ {results.success.length} certificados generados exitosamente
                    </strong>
                  </p>
                )}
                {results.failed.length > 0 && (
                  <p className="text-sm">
                    <strong className="text-red-600">
                      ✗ {results.failed.length} certificados fallidos
                    </strong>
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Selection controls */}
        {eligibleItems.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.size === eligibleItems.length && eligibleItems.length > 0}
                onCheckedChange={toggleAll}
                disabled={processing}
              />
              <label className="text-sm font-medium">
                Seleccionar todas ({selectedItems.size} seleccionadas)
              </label>
            </div>

            <Button
              onClick={processBatch}
              disabled={selectedItems.size === 0 || processing}
              className="bg-gradient-gold"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Certificar {selectedItems.size} Joyas
                </>
              )}
            </Button>
          </div>
        )}

        {/* Jewelry list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {eligibleItems.length === 0 && certifiedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tienes joyas disponibles</p>
              <p className="text-sm mt-1">Crea joyas primero para poder certificarlas</p>
            </div>
          ) : eligibleItems.length === 0 ? (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Todas tus joyas ya están certificadas
              </AlertDescription>
            </Alert>
          ) : (
            eligibleItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-colors ${
                  selectedItems.has(item.id) ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => !processing && toggleItem(item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                      disabled={processing}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.type} • {item.status}
                      </p>
                    </div>

                    {item.hasCertificate ? (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Certificada
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
