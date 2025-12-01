import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplaceListings, MarketplaceListing } from "@/hooks/useMarketplaceListings";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MyListingsProps {
  showHeader?: boolean;
  limit?: number;
}

export const MyListings = ({ showHeader = true, limit }: MyListingsProps) => {
  const { user } = useAuth();
  const { listings, loading, getUserListings, deleteListing, updateListing } = useMarketplaceListings();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const myListings = user ? getUserListings(user.id) : [];
  
  const filteredListings = myListings.filter(listing => {
    const matchesSearch = listing.jewelry_item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).slice(0, limit);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'sold' | 'inactive') => {
    try {
      await updateListing(listingId, { status: newStatus });
      toast.success('Estado actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      toast.success('Listado eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el listado');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'sold':
        return 'secondary';
      case 'inactive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'sold':
        return 'Vendido';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Listados</h2>
          </div>
        )}
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mis Listados en Marketplace</h2>
            <p className="text-muted-foreground">
              Gestiona tus productos en venta
            </p>
          </div>
          <Button asChild className="bg-gradient-gold text-background hover:scale-105 transition-transform">
            <Link to="/crear-listado">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Listado
            </Link>
          </Button>
        </div>
      )}

      {/* Filters */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar en mis listados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="sold">Vendidos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stats Summary */}
      {showHeader && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <div className="text-2xl font-bold">{myListings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Activos</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {myListings.filter(l => l.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Vendidos</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {myListings.filter(l => l.status === 'sold').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Valor Total</span>
              </div>
              <div className="text-2xl font-bold">
                {formatPrice(
                  myListings.filter(l => l.status === 'active').reduce((sum, l) => sum + l.price, 0),
                  'COP'
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {myListings.length === 0 ? 'No tienes listados' : 'No se encontraron resultados'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {myListings.length === 0 
                ? 'Crea tu primer listado para empezar a vender en el marketplace'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {myListings.length === 0 && (
              <Button asChild className="bg-gradient-gold text-background">
                <Link to="/crear-listado">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Listado
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted/20 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{listing.jewelry_item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {listing.jewelry_item.materials.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(listing.price, listing.currency)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {getStatusLabel(listing.status)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {listing.featured && (
                        <Badge className="bg-gradient-gold text-background">
                          <Star className="w-3 h-3 mr-1" />
                          Destacado
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(listing.created_at)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/marketplace`} className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver en Marketplace
                            </Link>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 
                            listing.status === 'active' ? 'inactive' : 'active'
                          )}>
                            {listing.status === 'active' ? (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Activar
                              </>
                            )}
                          </DropdownMenuItem>
                          
                          {listing.status !== 'sold' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(listing.id, 'sold')}>
                              <Star className="w-4 h-4 mr-2" />
                              Marcar como Vendido
                            </DropdownMenuItem>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar listado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El listado será eliminado permanentemente del marketplace.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(listing.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Show more link if limited */}
      {limit && myListings.length > limit && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/mi-marketplace">
              Ver todos mis listados ({myListings.length})
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};