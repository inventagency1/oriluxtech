import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Trash2, RotateCcw, Eye, DollarSign } from "lucide-react";

interface Product {
  id: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  jewelry_item: {
    name: string;
    type: string;
    main_image_url: string;
  } | null;
  seller: {
    business_name: string;
    full_name: string;
  } | null;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('marketplace_listings')
        .select(`
          id,
          price,
          currency,
          status,
          created_at,
          seller_id,
          jewelry_item:jewelry_items!marketplace_listings_jewelry_item_id_fkey (
            name,
            type,
            main_image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: listings, error } = await query;
      if (error) throw error;

      // Fetch seller profiles separately
      if (listings && listings.length > 0) {
        const sellerIds = [...new Set(listings.map(l => l.seller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, business_name, full_name')
          .in('user_id', sellerIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const productsWithSellers = listings.map(listing => ({
          ...listing,
          seller: profileMap.get(listing.seller_id) || { business_name: 'N/A', full_name: 'N/A' }
        }));

        setProducts(productsWithSellers as any);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'deleted' })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success('Producto eliminado exitosamente');
      fetchProducts();
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
    }
  };

  const handleRestore = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'active' })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success('Producto restaurado exitosamente');
      fetchProducts();
      setRestoreDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error restoring product:', error);
      toast.error('Error al restaurar producto');
    }
  };

  const filteredProducts = products.filter(product =>
    product.jewelry_item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      sold: 'secondary',
      inactive: 'outline',
      deleted: 'destructive',
    };

    const labels: Record<string, string> = {
      active: 'Activo',
      sold: 'Vendido',
      inactive: 'Inactivo',
      deleted: 'Eliminado',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Productos del Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Cargando productos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Productos del Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o joyería..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="sold">Vendidos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="deleted">Eliminados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Joyería</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.jewelry_item?.main_image_url && (
                            <img
                              src={product.jewelry_item.main_image_url}
                              alt={product.jewelry_item?.name || 'Producto'}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.jewelry_item?.name || 'Sin nombre'}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.jewelry_item?.type || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.seller?.business_name || product.seller?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {formatPrice(product.price, product.currency)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/listing/${product.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {product.status === 'deleted' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el producto como eliminado y desaparecerá del marketplace.
              Los datos se conservarán para reportes y podrás restaurarlo más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              El producto volverá a estar visible en el marketplace como activo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
