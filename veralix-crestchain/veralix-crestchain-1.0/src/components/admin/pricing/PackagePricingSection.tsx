import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Edit, Plus, Trash2 } from "lucide-react";
import { useCertificatePackages } from "@/hooks/useCertificatePackages";

export function PackagePricingSection() {
  const { packages, loading, fetchPackages, upsertPackage, deletePackage } = useCertificatePackages();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  const [formData, setFormData] = useState({
    package_id: '',
    package_name: '',
    certificates_count: '',
    base_price: '',
    currency: 'COP',
    description: '',
    features: '',
    icon_name: 'Package',
    color_scheme: 'primary',
    discount_percentage: '0',
    is_active: true,
    is_popular: false,
    display_order: '0'
  });

  useEffect(() => {
    fetchPackages(true);
  }, [fetchPackages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const featuresArray = formData.features
      .split('\n')
      .filter(f => f.trim())
      .map(f => f.trim());

    const packageData = {
      ...(editingPackage?.id && { id: editingPackage.id }),
      package_id: formData.package_id,
      package_name: formData.package_name,
      certificates_count: parseInt(formData.certificates_count),
      base_price: parseFloat(formData.base_price),
      currency: formData.currency,
      description: formData.description,
      features: featuresArray,
      icon_name: formData.icon_name,
      color_scheme: formData.color_scheme,
      discount_percentage: parseFloat(formData.discount_percentage),
      is_active: formData.is_active,
      is_popular: formData.is_popular,
      display_order: parseInt(formData.display_order)
    };

    await upsertPackage(packageData);
    setIsDialogOpen(false);
    setEditingPackage(null);
    resetForm();
  };

  const handleEdit = (pkg: any) => {
    setEditingPackage(pkg);
    setFormData({
      package_id: pkg.package_id,
      package_name: pkg.package_name,
      certificates_count: pkg.certificates_count.toString(),
      base_price: pkg.base_price.toString(),
      currency: pkg.currency,
      description: pkg.description || '',
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : '',
      icon_name: pkg.icon_name || 'Package',
      color_scheme: pkg.color_scheme || 'primary',
      discount_percentage: pkg.discount_percentage?.toString() || '0',
      is_active: pkg.is_active,
      is_popular: pkg.is_popular || false,
      display_order: pkg.display_order?.toString() || '0'
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este paquete?')) {
      await deletePackage(id);
    }
  };

  const resetForm = () => {
    setFormData({
      package_id: '',
      package_name: '',
      certificates_count: '',
      base_price: '',
      currency: 'COP',
      description: '',
      features: '',
      icon_name: 'Package',
      color_scheme: 'primary',
      discount_percentage: '0',
      is_active: true,
      is_popular: false,
      display_order: '0'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Paquetes de Certificados</span>
            </CardTitle>
            <CardDescription>
              Configura los paquetes de certificados disponibles para compra
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingPackage(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold hover:shadow-gold">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Paquete
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPackage ? 'Editar Paquete' : 'Nuevo Paquete de Certificados'}
                </DialogTitle>
                <DialogDescription>
                  {editingPackage ? 'Modifica el paquete existente' : 'Crea un nuevo paquete de certificados'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="package_id">ID del Paquete</Label>
                    <Input
                      id="package_id"
                      value={formData.package_id}
                      onChange={(e) => setFormData({...formData, package_id: e.target.value})}
                      placeholder="pack-10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="package_name">Nombre</Label>
                    <Input
                      id="package_name"
                      value={formData.package_name}
                      onChange={(e) => setFormData({...formData, package_name: e.target.value})}
                      placeholder="Paquete Básico"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificates_count">Cantidad</Label>
                    <Input
                      id="certificates_count"
                      type="number"
                      value={formData.certificates_count}
                      onChange={(e) => setFormData({...formData, certificates_count: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Precio</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_percentage">Descuento %</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del paquete"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Características (una por línea)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({...formData, features: e.target.value})}
                    placeholder="Característica 1&#10;Característica 2&#10;Característica 3"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon_name">Ícono</Label>
                    <Input
                      id="icon_name"
                      value={formData.icon_name}
                      onChange={(e) => setFormData({...formData, icon_name: e.target.value})}
                      placeholder="Package"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color_scheme">Esquema de Color</Label>
                    <Input
                      id="color_scheme"
                      value={formData.color_scheme}
                      onChange={(e) => setFormData({...formData, color_scheme: e.target.value})}
                      placeholder="primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">Orden</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Activo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_popular"
                      checked={formData.is_popular}
                      onCheckedChange={(checked) => setFormData({...formData, is_popular: checked})}
                    />
                    <Label htmlFor="is_popular">Popular</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingPackage ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Cargando paquetes...</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Certificados</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div className="font-medium">{pkg.package_name}</div>
                      <div className="text-sm text-muted-foreground">{pkg.package_id}</div>
                    </TableCell>
                    <TableCell>{pkg.certificates_count}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${pkg.base_price.toLocaleString()} {pkg.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${pkg.price_per_certificate.toFixed(0)}/cert
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.discount_percentage > 0 ? (
                        <Badge variant="secondary">{pkg.discount_percentage}%</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pkg.is_active && <Badge variant="default">Activo</Badge>}
                        {pkg.is_popular && <Badge variant="secondary">Popular</Badge>}
                        {!pkg.is_active && <Badge variant="outline">Inactivo</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {packages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay paquetes configurados</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
