import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DollarSign, Edit, Plus, Trash2, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PricingRule {
  id: string;
  jewelry_type: string;
  client_category: string;
  base_price: number;
  currency: string;
  discount_percentage: number;
  min_quantity?: number;
  max_quantity?: number;
  is_active: boolean;
  created_at: string;
}

export function IndividualPricingSection() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    jewelry_type: 'anillo' as 'anillo' | 'aretes' | 'broche' | 'cadena' | 'collar' | 'dije' | 'gemelos' | 'otro' | 'pulsera' | 'reloj',
    client_category: 'regular' as 'regular' | 'premium' | 'corporativo' | 'mayorista',
    base_price: '',
    currency: 'COP',
    discount_percentage: '0',
    min_quantity: '1',
    max_quantity: '',
    is_active: true
  });

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificate_pricing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPricingRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reglas de precios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jewelry_type) {
      toast({
        title: "Error",
        description: "Debes seleccionar un tipo de joya",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const pricingData = {
        jewelry_type: formData.jewelry_type,
        client_category: formData.client_category,
        base_price: parseFloat(formData.base_price),
        currency: formData.currency,
        discount_percentage: parseFloat(formData.discount_percentage),
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null,
        is_active: formData.is_active
      };

      let error;
      if (editingRule) {
        const { error: updateError } = await supabase
          .from('certificate_pricing')
          .update(pricingData)
          .eq('id', editingRule.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('certificate_pricing')
          .insert([pricingData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Éxito",
        description: editingRule ? "Regla actualizada exitosamente" : "Regla creada exitosamente",
      });

      setIsDialogOpen(false);
      setEditingRule(null);
      resetForm();
      fetchPricingRules();
    } catch (error: any) {
      console.error('Error saving pricing rule:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la regla de precios",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta regla?')) return;
    
    try {
      const { error } = await supabase
        .from('certificate_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Regla eliminada exitosamente",
      });

      fetchPricingRules();
    } catch (error: any) {
      console.error('Error deleting pricing rule:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la regla",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      jewelry_type: rule.jewelry_type as any,
      client_category: rule.client_category as any,
      base_price: rule.base_price.toString(),
      currency: rule.currency,
      discount_percentage: rule.discount_percentage.toString(),
      min_quantity: rule.min_quantity?.toString() || '1',
      max_quantity: rule.max_quantity?.toString() || '',
      is_active: rule.is_active
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      jewelry_type: 'anillo' as any,
      client_category: 'regular',
      base_price: '',
      currency: 'COP',
      discount_percentage: '0',
      min_quantity: '1',
      max_quantity: '',
      is_active: true
    });
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      regular: 'secondary',
      premium: 'default',
      corporativo: 'destructive',
      mayorista: 'outline'
    } as const;
    
    return <Badge variant={variants[category as keyof typeof variants] || 'secondary'}>
      {category.toUpperCase()}
    </Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Precios por Tipo de Joya</span>
            </CardTitle>
            <CardDescription>
              Configura los precios de certificación individual por tipo de joya y categoría de cliente
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingRule(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold hover:shadow-gold">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Editar Regla de Precios' : 'Nueva Regla de Precios'}
                </DialogTitle>
                <DialogDescription>
                  {editingRule ? 'Modifica la regla existente' : 'Crea una nueva regla de precios para certificación'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jewelry_type">Tipo de Joya</Label>
                  <Select value={formData.jewelry_type} onValueChange={(value: any) => setFormData({...formData, jewelry_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anillo">Anillo</SelectItem>
                      <SelectItem value="collar">Collar</SelectItem>
                      <SelectItem value="pulsera">Pulsera</SelectItem>
                      <SelectItem value="aretes">Aretes</SelectItem>
                      <SelectItem value="reloj">Reloj</SelectItem>
                      <SelectItem value="broche">Broche</SelectItem>
                      <SelectItem value="cadena">Cadena</SelectItem>
                      <SelectItem value="dije">Dije</SelectItem>
                      <SelectItem value="gemelos">Gemelos</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_category">Categoría de Cliente</Label>
                  <Select value={formData.client_category} onValueChange={(value: 'regular' | 'premium' | 'corporativo' | 'mayorista') => setFormData({...formData, client_category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="corporativo">Corporativo</SelectItem>
                      <SelectItem value="mayorista">Mayorista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Precio Base</Label>
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
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Descuento (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_quantity">Cantidad Mínima</Label>
                    <Input
                      id="min_quantity"
                      type="number"
                      min="1"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_quantity">Cantidad Máxima</Label>
                    <Input
                      id="max_quantity"
                      type="number"
                      value={formData.max_quantity}
                      onChange={(e) => setFormData({...formData, max_quantity: e.target.value})}
                      placeholder="Sin límite"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Regla activa</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Actualizar' : 'Crear'}
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
            <p className="text-muted-foreground mt-2">Cargando reglas de precios...</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Joya</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium capitalize">
                      {rule.jewelry_type}
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(rule.client_category)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${rule.base_price.toLocaleString()} {rule.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.discount_percentage > 0 ? `${rule.discount_percentage}%` : 'Sin descuento'}
                    </TableCell>
                    <TableCell>
                      {rule.min_quantity || 1} - {rule.max_quantity || '∞'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
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
            
            {pricingRules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay reglas de precios configuradas</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
