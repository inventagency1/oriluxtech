import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { usePackageCategoryPricing } from '@/hooks/usePackageCategoryPricing';
import { useCertificatePackages } from '@/hooks/useCertificatePackages';
import { CLIENT_CATEGORY_LABELS, type ClientCategory } from '@/hooks/useClientCategories';
import { Plus, Pencil, Trash2, DollarSign } from 'lucide-react';

export function CategoryPricingTab() {
  const {
    loading,
    pricingRules,
    fetchPricingRules,
    upsertPricingRule,
    deletePricingRule
  } = usePackageCategoryPricing();

  const { packages, fetchPackages } = useCertificatePackages();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [formData, setFormData] = useState({
    package_id: '',
    client_category: 'regular' as ClientCategory,
    adjusted_price: '',
    discount_percentage: '',
    is_active: true
  });

  useEffect(() => {
    fetchPricingRules();
    fetchPackages();
  }, []);

  const handleSubmit = async () => {
    if (!formData.package_id || !formData.adjusted_price) return;

    const result = await upsertPricingRule({
      id: editingRule?.id,
      package_id: formData.package_id,
      client_category: formData.client_category,
      adjusted_price: parseFloat(formData.adjusted_price),
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : 0,
      is_active: formData.is_active
    });

    if (result) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      package_id: rule.package_id,
      client_category: rule.client_category,
      adjusted_price: rule.adjusted_price.toString(),
      discount_percentage: rule.discount_percentage?.toString() || '0',
      is_active: rule.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta regla de pricing?')) {
      await deletePricingRule(id);
    }
  };

  const resetForm = () => {
    setFormData({
      package_id: '',
      client_category: 'regular',
      adjusted_price: '',
      discount_percentage: '',
      is_active: true
    });
    setEditingRule(null);
  };

  const getCategoryBadge = (category: ClientCategory) => {
    const colors = {
      regular: 'bg-muted text-muted-foreground',
      premium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      corporativo: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      mayorista: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    };
    return colors[category] || colors.regular;
  };

  const getPackageBasePrice = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.base_price || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Precios de Paquetes por Categoría</CardTitle>
              <CardDescription>
                Configura precios especiales de paquetes según la categoría del cliente
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'Editar Regla de Pricing' : 'Crear Regla de Pricing'}
                  </DialogTitle>
                  <DialogDescription>
                    Configura el precio de un paquete para una categoría específica
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Paquete</Label>
                    <Select
                      value={formData.package_id}
                      onValueChange={(value) => {
                        setFormData({ ...formData, package_id: value });
                        const basePrice = getPackageBasePrice(value);
                        if (!formData.adjusted_price) {
                          setFormData(prev => ({ ...prev, adjusted_price: basePrice.toString() }));
                        }
                      }}
                      disabled={!!editingRule}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paquete" />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.package_name} - {pkg.certificates_count} certificados
                            (Base: ${pkg.base_price.toLocaleString('es-CO')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Categoría de Cliente</Label>
                    <Select
                      value={formData.client_category}
                      onValueChange={(value) => setFormData({ ...formData, client_category: value as ClientCategory })}
                      disabled={!!editingRule}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Precio Ajustado (COP)</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 250000"
                      value={formData.adjusted_price}
                      onChange={(e) => setFormData({ ...formData, adjusted_price: e.target.value })}
                    />
                    {formData.package_id && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Precio base: ${getPackageBasePrice(formData.package_id).toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Porcentaje de Descuento (%)</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 10"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Regla Activa</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? 'Guardando...' : 'Guardar Regla'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio Base</TableHead>
                  <TableHead>Precio Ajustado</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : pricingRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No hay reglas de pricing configuradas
                    </TableCell>
                  </TableRow>
                ) : (
                  pricingRules.map((rule) => {
                    const basePrice = getPackageBasePrice(rule.package_id);
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.package_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {rule.certificates_count} certificados
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadge(rule.client_category as ClientCategory)}>
                            {CLIENT_CATEGORY_LABELS[rule.client_category as ClientCategory]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          ${basePrice.toLocaleString('es-CO')}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            ${Number(rule.adjusted_price).toLocaleString('es-CO')}
                          </span>
                        </TableCell>
                        <TableCell>
                          {rule.discount_percentage > 0 ? (
                            <Badge variant="secondary">
                              -{rule.discount_percentage}%
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                            {rule.is_active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rule)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Información sobre el sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cómo Funciona el Sistema de Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • <strong>Precio Base:</strong> El precio configurado en el paquete que aplica a todos por defecto
          </p>
          <p>
            • <strong>Precio Ajustado:</strong> Precio especial que verán los clientes de esta categoría
          </p>
          <p>
            • <strong>Descuento:</strong> Se muestra al cliente para destacar el beneficio de su categoría
          </p>
          <p>
            • <strong>Prioridad:</strong> Si un cliente tiene categoría asignada, se usa el precio ajustado; si no, se usa el precio base
          </p>
        </CardContent>
      </Card>
    </div>
  );
}