import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useMarketplaceListings } from "@/hooks/useMarketplaceListings";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Package, 
  DollarSign, 
  Tag, 
  FileText, 
  Star,
  ShoppingBag,
  Upload,
  Gem
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const listingSchema = z.object({
  jewelry_item_id: z.string().min(1, "Debes seleccionar una joya"),
  price: z.number().min(1, "El precio debe ser mayor a 0"),
  currency: z.string().default("COP"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres"),
  featured: z.boolean().default(false)
});

type ListingFormData = z.infer<typeof listingSchema>;

interface JewelryItem {
  id: string;
  name: string;
  type: string;
  materials: string[];
  weight?: number;
  dimensions?: string;
  origin?: string;
  craftsman?: string;
  images_count: number;
  status: string;
}

const CreateListing = () => {
  const { user } = useAuth();
  const { isJoyero } = useUserRole();
  const { createListing } = useMarketplaceListings();
  const { autoCompleteTask } = useOnboarding();
  const navigate = useNavigate();
  const [jewelryItems, setJewelryItems] = useState<JewelryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      currency: "COP",
      featured: false,
      description: ""
    }
  });

  const selectedJewelryId = watch("jewelry_item_id");
  const selectedJewelry = jewelryItems.find(item => item.id === selectedJewelryId);

  useEffect(() => {
    fetchUserJewelryItems();
  }, [user]);

  const fetchUserJewelryItems = async () => {
    if (!user) return;

    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('jewelry_items')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['draft', 'certified']); // Use valid enum values

      if (error) throw error;

      setJewelryItems(data || []);
    } catch (error) {
      console.error('Error fetching jewelry items:', error);
      toast.error('Error al cargar tus joyas');
    } finally {
      setLoadingItems(false);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un listado');
      return;
    }

    if (!isJoyero) {
      toast.error('Solo las joyerías pueden crear listados en el marketplace');
      return;
    }

    // Validate required fields
    if (!data.jewelry_item_id || !data.price || data.price <= 0) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const result = await createListing({
        jewelry_item_id: data.jewelry_item_id,
        price: data.price,
        currency: data.currency || 'COP',
        description: data.description || '',
        featured: data.featured || false
      });
      
      if (result.success) {
        toast.success('¡Listado creado exitosamente!');
        // Auto-complete onboarding task
        await autoCompleteTask('marketplace-listing');
        navigate('/marketplace');
      } else {
        toast.error('Error al crear el listado');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Error al crear el listado');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getJewelryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'ring': 'Anillo',
      'necklace': 'Collar',
      'bracelet': 'Pulsera',
      'earrings': 'Aretes',
      'watch': 'Reloj',
      'pendant': 'Colgante'
    };
    return types[type] || type;
  };

  if (!user || !isJoyero) {
    return (
      <AppLayout>
        <div className="container mx-auto px-6 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Acceso Restringido</CardTitle>
              <CardDescription>
                Solo las joyerías pueden crear listados en el marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Si eres un joyero y necesitas acceso, contacta con el administrador.
              </p>
              <div className="flex space-x-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/marketplace">Ver Marketplace</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Crear Nuevo <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">Listado</span>
            </h1>
            <p className="text-muted-foreground">
              Vende tus joyas certificadas en el marketplace de Veralix
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Seleccionar Joya</span>
                    </CardTitle>
                    <CardDescription>
                      Elige la joya que deseas vender en el marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="jewelry_item_id">Joya *</Label>
                        <Controller
                          name="jewelry_item_id"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una joya" />
                              </SelectTrigger>
                              <SelectContent>
                                {loadingItems ? (
                                  <SelectItem value="loading" disabled>
                                    Cargando joyas...
                                  </SelectItem>
                                ) : jewelryItems.length === 0 ? (
                                  <SelectItem value="no-items" disabled>
                                    No tienes joyas disponibles
                                  </SelectItem>
                                ) : (
                                  jewelryItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.name} - {getJewelryTypeLabel(item.type)}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.jewelry_item_id && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.jewelry_item_id.message}
                          </p>
                        )}
                        
                        {jewelryItems.length === 0 && !loadingItems && (
                          <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                              No tienes joyas disponibles para vender
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link to="/nueva-joya">
                                <Upload className="w-4 h-4 mr-2" />
                                Agregar Nueva Joya
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Precio</span>
                    </CardTitle>
                    <CardDescription>
                      Establece el precio de venta para tu joya
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="price">Precio *</Label>
                          <Controller
                            name="price"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                          {errors.price && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.price.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="currency">Moneda</Label>
                          <Controller
                            name="currency"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="COP">COP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Descripción</span>
                    </CardTitle>
                    <CardDescription>
                      Describe tu joya para atraer compradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              placeholder="Describe las características especiales, la historia o cualquier detalle relevante de tu joya..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          )}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.description.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {watch("description")?.length || 0}/500 caracteres
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="w-5 h-5" />
                      <span>Opciones Adicionales</span>
                    </CardTitle>
                    <CardDescription>
                      Opciones para destacar tu listado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="featured"
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>Listado Destacado</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Los listados destacados aparecen en la sección principal del marketplace
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vista Previa</CardTitle>
                    <CardDescription>
                      Así se verá tu listado en el marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedJewelry ? (
                      <div className="space-y-4">
                        <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{selectedJewelry.name}</h3>
                            {watch("featured") && (
                              <Badge className="bg-gradient-gold text-background">
                                <Star className="w-3 h-3 mr-1" />
                                Destacado
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {getJewelryTypeLabel(selectedJewelry.type)}
                          </p>
                          
                          {watch("price") > 0 && (
                            <p className="text-2xl font-bold text-foreground">
                              {formatPrice(watch("price"), watch("currency"))}
                            </p>
                          )}
                          
                          {watch("description") && (
                            <p className="text-sm text-muted-foreground">
                              {watch("description")}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {selectedJewelry.materials.slice(0, 3).map((material, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Selecciona una joya para ver la vista previa
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-gold text-background hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    {loading ? "Creando..." : "Crear Listado"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/marketplace')}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default CreateListing;