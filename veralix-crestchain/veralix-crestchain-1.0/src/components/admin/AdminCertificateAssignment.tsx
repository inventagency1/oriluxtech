import { useState, useEffect } from 'react';
import { useAdminCertificateAssignment } from '@/hooks/useAdminCertificateAssignment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  DollarSign, 
  Users, 
  TrendingUp, 
  FileText,
  Search,
  Loader2,
  CheckCircle,
  Gift,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PACKAGE_PRESETS = [
  { name: 'Paquete Prueba', certificates: 10, price: 50000 },
  { name: 'Paquete Básico', certificates: 25, price: 100000 },
  { name: 'Paquete Profesional', certificates: 50, price: 175000 },
  { name: 'Paquete Empresarial', certificates: 100, price: 300000 },
];

const PAYMENT_TYPES = [
  { value: 'external', label: 'Pago Externo', icon: Banknote, description: 'Transferencia, efectivo, etc.' },
  { value: 'free_trial', label: 'Prueba Gratuita', icon: Gift, description: 'Sin costo para el usuario' },
  { value: 'promotional', label: 'Promocional', icon: TrendingUp, description: 'Descuento o promoción' },
  { value: 'compensation', label: 'Compensación', icon: CheckCircle, description: 'Por inconvenientes o soporte' },
];

const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Transferencia Bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' },
];

export function AdminCertificateAssignment() {
  const {
    loading,
    assignments,
    incomeSummary,
    assignCertificates,
    fetchAssignments,
    fetchIncomeSummary,
    searchUsers
  } = useAdminCertificateAssignment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    targetEmail: '',
    certificatesCount: 10,
    packageName: 'Paquete de Prueba',
    paymentType: 'external' as const,
    paymentReference: '',
    paymentMethod: '' as 'transfer' | 'cash' | 'check' | 'other' | '',
    amountPaid: 0,
    currency: 'COP',
    notes: '',
    invoiceNumber: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchIncomeSummary();
  }, []);

  // Búsqueda de usuarios con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePresetSelect = (preset: typeof PACKAGE_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      packageName: preset.name,
      certificatesCount: preset.certificates,
      amountPaid: preset.price
    }));
  };

  const handleSubmit = async () => {
    if (!formData.targetEmail) {
      return;
    }

    const result = await assignCertificates({
      targetEmail: formData.targetEmail,
      certificatesCount: formData.certificatesCount,
      packageName: formData.packageName,
      paymentType: formData.paymentType,
      paymentReference: formData.paymentReference || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      amountPaid: formData.amountPaid,
      currency: formData.currency,
      notes: formData.notes || undefined,
      invoiceNumber: formData.invoiceNumber || undefined
    });

    if (result.success) {
      setIsDialogOpen(false);
      resetForm();
      fetchIncomeSummary();
    }
  };

  const resetForm = () => {
    setFormData({
      targetEmail: '',
      certificatesCount: 10,
      packageName: 'Paquete de Prueba',
      paymentType: 'external',
      paymentReference: '',
      paymentMethod: '',
      amountPaid: 0,
      currency: 'COP',
      notes: '',
      invoiceNumber: ''
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectUser = (user: any) => {
    setFormData(prev => ({ ...prev, targetEmail: user.email }));
    setSearchQuery(user.email);
    setSearchResults([]);
  };

  const getPaymentTypeBadge = (type: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      external: { variant: 'default', label: 'Pago Externo' },
      free_trial: { variant: 'secondary', label: 'Prueba Gratis' },
      promotional: { variant: 'outline', label: 'Promocional' },
      compensation: { variant: 'destructive', label: 'Compensación' }
    };
    const { variant, label } = config[type] || { variant: 'secondary', label: type };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asignación de Certificados</h2>
          <p className="text-muted-foreground">
            Asigna paquetes de certificados a usuarios y registra ingresos externos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Asignar Certificados
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Asignar Paquete de Certificados</DialogTitle>
              <DialogDescription>
                Asigna certificados a un usuario registrado y registra el pago si aplica
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Búsqueda de usuario */}
              <div className="space-y-2">
                <Label>Usuario Destino</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email o nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFormData(prev => ({ ...prev, targetEmail: e.target.value }));
                    }}
                    className="pl-10"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.user_id}
                        className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                        onClick={() => selectUser(user)}
                      >
                        <p className="font-medium">{user.full_name || user.business_name || 'Sin nombre'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Paquetes predefinidos */}
              <div className="space-y-2">
                <Label>Paquetes Rápidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PACKAGE_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant={formData.packageName === preset.name ? 'default' : 'outline'}
                      className="justify-start h-auto py-3"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">{preset.certificates} certificados</p>
                        <p className="text-xs opacity-70">
                          ${preset.price.toLocaleString('es-CO')} COP
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cantidad personalizada */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad de Certificados</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.certificatesCount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      certificatesCount: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre del Paquete</Label>
                  <Input
                    value={formData.packageName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      packageName: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <Separator />

              {/* Tipo de pago */}
              <div className="space-y-2">
                <Label>Tipo de Asignación</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant={formData.paymentType === type.value ? 'default' : 'outline'}
                      className="justify-start h-auto py-3"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        paymentType: type.value as any,
                        amountPaid: type.value === 'free_trial' || type.value === 'compensation' ? 0 : prev.amountPaid
                      }))}
                    >
                      <type.icon className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs opacity-70">{type.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Información de pago (solo si es pago externo) */}
              {formData.paymentType === 'external' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Información del Pago
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Monto Pagado</Label>
                        <Input
                          type="number"
                          min={0}
                          value={formData.amountPaid}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            amountPaid: parseFloat(e.target.value) || 0 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Método de Pago</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            paymentMethod: value as any 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Referencia de Pago</Label>
                        <Input
                          placeholder="Ej: Transferencia #12345"
                          value={formData.paymentReference}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            paymentReference: e.target.value 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número de Factura (opcional)</Label>
                        <Input
                          placeholder="Ej: FAC-001"
                          value={formData.invoiceNumber}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            invoiceNumber: e.target.value 
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Notas */}
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Agregar notas sobre esta asignación..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !formData.targetEmail || formData.certificatesCount <= 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Asignar Certificados
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${(incomeSummary?.total_income || 0).toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-muted-foreground">COP por pagos externos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Certificados Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(incomeSummary?.total_certificates_assigned || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Asignaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {incomeSummary?.total_assignments || 0}
            </p>
            <p className="text-xs text-muted-foreground">Paquetes asignados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4 text-orange-500" />
              Por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {incomeSummary?.by_payment_type && Object.entries(incomeSummary.by_payment_type).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{type.replace('_', ' ')}</span>
                  <span className="font-medium">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de asignaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Asignaciones
          </CardTitle>
          <CardDescription>
            Registro de todos los paquetes de certificados asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && assignments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay asignaciones registradas</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Asignación
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Certificados</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(assignment.created_at), "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{assignment.target_user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          Por: {assignment.assigned_by_admin_email}
                        </p>
                      </TableCell>
                      <TableCell>{assignment.package_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.certificates_count}</Badge>
                      </TableCell>
                      <TableCell>{getPaymentTypeBadge(assignment.payment_type)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {assignment.amount_paid > 0 ? (
                          <span className="text-green-600">
                            ${assignment.amount_paid.toLocaleString('es-CO')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {assignment.payment_reference || assignment.invoice_number || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
