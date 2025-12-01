import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, Image, FileText, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMarketplaceCleanup } from "@/hooks/useMarketplaceCleanup";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProblematicListing {
  id: string;
  jewelry_name: string;
  price: number;
  images_count: number;
  description: string | null;
  created_at: string;
  issues: string[];
}

export function MarketplaceCleanupPanel() {
  const [problematicListings, setProblematicListings] = useState<ProblematicListing[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    withoutImages: 0,
    withoutDescription: 0,
    invalidPrice: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  const {
    loading,
    cleanupMarketplace,
    generateAllImages,
    enhanceAllDescriptions
  } = useMarketplaceCleanup();

  useEffect(() => {
    fetchProblematicListings();
  }, []);

  const fetchProblematicListings = async () => {
    setLoadingStats(true);
    try {
      const { data: listings, error } = await supabase
        .from('marketplace_listings_complete')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const problematic: ProblematicListing[] = [];
      let withoutImages = 0;
      let withoutDescription = 0;
      let invalidPrice = 0;

      listings?.forEach((listing: any) => {
        const issues: string[] = [];

        // Sin imágenes
        if (!listing.jewelry_images_count || listing.jewelry_images_count === 0) {
          issues.push('Sin imágenes');
          withoutImages++;
        }

        // Sin descripción válida
        if (!listing.description || listing.description.trim().length < 10) {
          issues.push('Sin descripción');
          withoutDescription++;
        }

        // Precio irreal
        if (listing.price > 100_000_000) {
          issues.push('Precio irreal');
          invalidPrice++;
        }

        // Nombre sospechoso
        if (listing.jewelry_name.toLowerCase().includes('prueba')) {
          issues.push('Nombre de prueba');
        }

        if (issues.length > 0) {
          problematic.push({
            id: listing.id,
            jewelry_name: listing.jewelry_name,
            price: listing.price,
            images_count: listing.jewelry_images_count || 0,
            description: listing.description,
            created_at: listing.created_at,
            issues
          });
        }
      });

      setProblematicListings(problematic);
      setStats({
        total: listings?.length || 0,
        withoutImages,
        withoutDescription,
        invalidPrice
      });
    } catch (error) {
      console.error('Error fetching problematic listings:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCleanup = async () => {
    await cleanupMarketplace();
    fetchProblematicListings();
  };

  const handleGenerateAllImages = async () => {
    await generateAllImages();
    fetchProblematicListings();
  };

  const handleEnhanceAllDescriptions = async () => {
    await enhanceAllDescriptions();
    fetchProblematicListings();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loadingStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Limpieza del Marketplace</CardTitle>
          <CardDescription>Cargando estadísticas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Productos</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sin Imágenes</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.withoutImages}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sin Descripción</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.withoutDescription}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Precio Inválido</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.invalidPrice}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Alertas */}
      {problematicListings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Productos Problemáticos Detectados</AlertTitle>
          <AlertDescription>
            Hay {problematicListings.length} productos con problemas que necesitan atención.
          </AlertDescription>
        </Alert>
      )}

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Automatizadas con AI</CardTitle>
          <CardDescription>
            Herramientas para limpiar y mejorar el marketplace usando inteligencia artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="destructive"
              onClick={handleCleanup}
              disabled={loading || problematicListings.length === 0}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Limpiar Productos Problemáticos
            </Button>

            <Button
              variant="outline"
              onClick={handleGenerateAllImages}
              disabled={loading || stats.withoutImages === 0}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Image className="w-4 h-4 mr-2" />
              )}
              Generar Imágenes con AI
              {stats.withoutImages > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.withoutImages}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleEnhanceAllDescriptions}
              disabled={loading || stats.withoutDescription === 0}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Mejorar Descripciones con AI
              {stats.withoutDescription > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {stats.withoutDescription}
                </Badge>
              )}
            </Button>
          </div>

          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Inteligencia Artificial</AlertTitle>
            <AlertDescription>
              Las imágenes se generan con <strong>google/gemini-2.5-flash-image</strong> y las descripciones con <strong>google/gemini-2.5-flash</strong> a través de Lovable AI Gateway.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Lista de Productos Problemáticos */}
      {problematicListings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos con Problemas</CardTitle>
            <CardDescription>
              {problematicListings.length} productos requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Imágenes</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Problemas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problematicListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      {listing.jewelry_name}
                    </TableCell>
                    <TableCell>{formatPrice(listing.price)}</TableCell>
                    <TableCell>
                      <Badge variant={listing.images_count > 0 ? "secondary" : "destructive"}>
                        {listing.images_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(listing.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {listing.issues.map((issue, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {problematicListings.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Marketplace Limpio!</h3>
              <p className="text-muted-foreground">
                No hay productos problemáticos en este momento
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
