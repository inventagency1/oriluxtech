import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClientCategories, CLIENT_CATEGORY_LABELS, CLIENT_CATEGORY_DESCRIPTIONS, type ClientCategory } from '@/hooks/useClientCategories';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { CategoryFilterBar } from '../CategoryFilterBar';

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  business_name: string | null;
}

interface CategoryWithProfile {
  id: string;
  user_id: string;
  category: ClientCategory;
  assigned_at: string;
  assigned_by: string;
  notes: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    business_name: string | null;
  };
}

export function ClientManagementTab() {
  const {
    loading,
    assignCategory,
    loadAllCategories,
    getUsersWithoutCategory,
    removeCategory,
    getCategoryDiscount
  } = useClientCategories();

  const [categories, setCategories] = useState<CategoryWithProfile[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClientCategory | 'all'>('all');

  const [formData, setFormData] = useState({
    user_id: '',
    category: 'regular' as ClientCategory,
    notes: ''
  });

  useEffect(() => {
    loadCategoriesWithProfiles();
    loadAvailableUsers();
  }, []);

  const loadCategoriesWithProfiles = async () => {
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from('client_categories')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (catError) throw catError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, business_name');

      if (profilesError) throw profilesError;

      const combinedData = categoriesData?.map(category => {
        const profile = profilesData?.find(p => p.user_id === category.user_id);
        return {
          ...category,
          profiles: profile || undefined
        };
      }) || [];

      setCategories(combinedData as CategoryWithProfile[]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAvailableUsers = async () => {
    const users = await getUsersWithoutCategory();
    setAvailableUsers(users as Profile[]);
  };

  const handleSubmit = async () => {
    if (!formData.user_id || !formData.category) return;

    const result = await assignCategory(
      formData.user_id,
      formData.category,
      formData.notes
    );

    if (result) {
      setIsDialogOpen(false);
      resetForm();
      loadCategoriesWithProfiles();
      loadAvailableUsers();
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      user_id: category.user_id,
      category: category.category,
      notes: category.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async (userId: string) => {
    if (confirm('¿Estás seguro de que deseas remover esta categoría?')) {
      await removeCategory(userId);
      loadCategoriesWithProfiles();
      loadAvailableUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      category: 'regular',
      notes: ''
    });
    setEditingCategory(null);
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

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = !searchTerm || 
      cat.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || cat.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Clientes por Categoría</CardTitle>
              <CardDescription>
                Asigna y administra categorías de clientes para aplicar descuentos personalizados
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Asignar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoría' : 'Asignar Categoría a Cliente'}
                  </DialogTitle>
                  <DialogDescription>
                    Selecciona el cliente y la categoría que deseas asignar
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label>Cliente</Label>
                    <Select
                      value={formData.user_id}
                      onValueChange={(value) => setFormData({ ...formData, user_id: value })}
                      disabled={!!editingCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name || user.email} 
                            {user.business_name && ` - ${user.business_name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value as ClientCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CLIENT_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label} - {getCategoryDiscount(key as ClientCategory)}% descuento
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {CLIENT_CATEGORY_DESCRIPTIONS[formData.category]}
                    </p>
                  </div>

                  <div>
                    <Label>Notas (opcional)</Label>
                    <Textarea
                      placeholder="Información adicional sobre esta asignación..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? 'Guardando...' : 'Guardar Categoría'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <CategoryFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={(value) => setSelectedCategory(value as ClientCategory | 'all')}
            onClearFilters={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          />

          <div className="mt-6 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Fecha de Asignación</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron categorías asignadas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {cat.profiles?.full_name || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {cat.profiles?.email}
                          </div>
                          {cat.profiles?.business_name && (
                            <div className="text-sm text-muted-foreground">
                              {cat.profiles.business_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadge(cat.category as ClientCategory)}>
                          {CLIENT_CATEGORY_LABELS[cat.category as ClientCategory]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-primary">
                          {getCategoryDiscount(cat.category as ClientCategory)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(cat.assigned_at).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {cat.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cat)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat.user_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </div>
  );
}