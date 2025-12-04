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
  Minus,
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
  Receipt,
  AlertTriangle
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
    reduceCertificates,
    getUserCertificateBalance,
    fetchAssignments,
    fetchIncomeSummary,
    searchUsers
  } = useAdminCertificateAssignment();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReduceDialogOpen, setIsReduceDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reduceSearchQuery, setReduceSearchQuery] = useState('');
  const [balanceSearchQuery, setBalanceSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [reduceSearchResults, setReduceSearchResults] = useState<any[]>([]);
  const [balanceSearchResults, setBalanceSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [reduceSearching, setReduceSearching] = useState(false);
  const [balanceSearching, setBalanceSearching] = useState(false);
  const [selectedUserBalance, setSelectedUserBalance] = useState<{ balance: number; name: string } | null>(null);
  const [consultedUserBalance, setConsultedUserBalance] = useState<{ balance: number; name: string; email: string; purchases: any[] } | null>(null);

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

  // Form state para reducir
  const [reduceFormData, setReduceFormData] = useState({
    targetUserId: '',
    targetEmail: '',
    certificatesCount: 1,
    reason: ''
  });

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

  // Búsqueda de usuarios para reducir con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (reduceSearchQuery.length >= 3) {
        setReduceSearching(true);
        const results = await searchUsers(reduceSearchQuery);
        setReduceSearchResults(results);
        setReduceSearching(false);
      } else {
        setReduceSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [reduceSearchQuery]);

  // Búsqueda de usuarios para consultar balance con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (balanceSearchQuery.length >= 3) {
        setBalanceSearching(true);
        const results = await searchUsers(balanceSearchQuery);
        setBalanceSearchResults(results);
        setBalanceSearching(false);
      } else {
        setBalanceSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [balanceSearchQuery]);

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

  // Seleccionar usuario para reducir
  const selectUserForReduce = async (user: any) => {
    console.log('Selected user for reduce:', user);
    setReduceFormData(prev => ({ 
      ...prev, 
      targetUserId: user.user_id,
      targetEmail: user.email 
    }));
    setReduceSearchQuery(user.email);
    setReduceSearchResults([]);
    
    // Obtener balance actual
    const result = await getUserCertificateBalance(user.email);
    if (result.success) {
      setSelectedUserBalance({ balance: result.balance, name: result.name });
    }
  };

  // Manejar submit de reducción
  const handleReduceSubmit = async () => {
    console.log('handleReduceSubmit called with:', reduceFormData);
    
    if (!reduceFormData.targetUserId || !reduceFormData.targetEmail || reduceFormData.certificatesCount <= 0) {
      console.log('Validation failed:', { 
        hasUserId: !!reduceFormData.targetUserId, 
        hasEmail: !!reduceFormData.targetEmail,
        count: reduceFormData.certificatesCount 
      });
      return;
    }

    const result = await reduceCertificates(
      reduceFormData.targetUserId,
      reduceFormData.targetEmail,
      reduceFormData.certificatesCount,
      reduceFormData.reason
    );

    if (result.success) {
      setIsReduceDialogOpen(false);
      resetReduceForm();
      fetchIncomeSummary();
    }
  };

  // Reset formulario de reducción
  const resetReduceForm = () => {
    setReduceFormData({
      targetUserId: '',
      targetEmail: '',
      certificatesCount: 1,
      reason: ''
    });
    setReduceSearchQuery('');
    setReduceSearchResults([]);
    setSelectedUserBalance(null);
  };

  // Seleccionar usuario para consultar balance
  const selectUserForBalance = async (user: any) => {
    setBalanceSearchQuery(user.email);
    setBalanceSearchResults([]);
    
    // Obtener balance detallado
    const result = await getUserCertificateBalance(user.email, true);
    if (result.success) {
      setConsultedUserBalance({
        balance: result.balance,
        name: result.name || user.full_name || user.business_name || user.email,
        email: user.email,
        purchases: result.purchases || []
      });
    }
  };

  // Reset consulta de balance
  const resetBalanceQuery = () => {
    setBalanceSearchQuery('');
    setBalanceSearchResults([]);
    setConsultedUserBalance(null);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Asignación de Certificados</h2>
          <p className="text-muted-foreground">
            Asigna o reduce certificados de usuarios
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botón Consultar Balance */}
          <Dialog open={isBalanceDialogOpen} onOpenChange={(open) => { setIsBalanceDialogOpen(open); if (!open) resetBalanceQuery(); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Consultar Balance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Consultar Balance de Certificados
                </DialogTitle>
                <DialogDescription>
                  Busca un usuario para ver cuántos certificados tiene disponibles
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Búsqueda de usuario */}
                <div className="space-y-2">
                  <Label>Buscar Usuario</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por email o nombre..."
                      value={balanceSearchQuery}
                      onChange={(e) => {
                        setBalanceSearchQuery(e.target.value);
                        if (consultedUserBalance && e.target.value !== consultedUserBalance.email) {
                          setConsultedUserBalance(null);
                        }
                      }}
                      className="pl-10"
                    />
                    {balanceSearching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {balanceSearchResults.length > 0 && (
                    <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                      {balanceSearchResults.map((user) => (
                        <button
                          key={user.user_id}
                          className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                          onClick={() => selectUserForBalance(user)}
                        >
                          <p className="font-medium">{user.full_name || user.business_name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resultado del balance */}
                {consultedUserBalance && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg">{consultedUserBalance.name}</p>
                          <p className="text-sm text-muted-foreground">{consultedUserBalance.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{consultedUserBalance.balance}</p>
                          <p className="text-sm text-muted-foreground">disponibles</p>
                        </div>
                      </div>
                    </div>

                    {/* Historial de paquetes */}
                    {consultedUserBalance.purchases && consultedUserBalance.purchases.length > 0 && (
                      <div className="space-y-2">
                        <Label>Historial de Paquetes</Label>
                        <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                          {consultedUserBalance.purchases.map((purchase: any) => (
                            <div key={purchase.id} className="p-3 text-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{purchase.package_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(purchase.purchased_at).toLocaleDateString('es-CO')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    {purchase.certificates_remaining}/{purchase.certificates_purchased}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {purchase.certificates_used} usados
                                  </p>
                                </div>
                              </div>
                              <div className="mt-1">
                                <Badge variant={purchase.payment_status === 'completed' ? 'default' : 'secondary'}>
                                  {purchase.payment_status === 'completed' ? 'Completado' : purchase.payment_status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {consultedUserBalance.purchases && consultedUserBalance.purchases.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Este usuario no tiene paquetes de certificados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsBalanceDialogOpen(false); resetBalanceQuery(); }}>
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botón Reducir Certificados */}
          <Dialog open={isReduceDialogOpen} onOpenChange={setIsReduceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Minus className="mr-2 h-4 w-4" />
                Reducir Certificados
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Reducir Certificados
                </DialogTitle>
                <DialogDescription>
                  Quita certificados del balance de un usuario
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Búsqueda de usuario */}
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por email o nombre..."
                      value={reduceSearchQuery}
                      onChange={(e) => {
                        setReduceSearchQuery(e.target.value);
                        // Solo limpiar si el usuario está escribiendo algo diferente al email seleccionado
                        if (e.target.value !== reduceFormData.targetEmail) {
                          setReduceFormData(prev => ({ ...prev, targetEmail: '', targetUserId: '' }));
                          setSelectedUserBalance(null);
                        }
                      }}
                      className="pl-10"
                    />
                    {reduceSearching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {reduceSearchResults.length > 0 && (
                    <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                      {reduceSearchResults.map((user) => (
                        <button
                          key={user.user_id}
                          className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
                          onClick={() => selectUserForReduce(user)}
                        >
                          <p className="font-medium">{user.full_name || user.business_name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Balance actual */}
                {selectedUserBalance && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Balance actual de {selectedUserBalance.name}</p>
                    <p className="text-2xl font-bold">{selectedUserBalance.balance} certificados</p>
                  </div>
                )}

                {/* Cantidad a reducir */}
                <div className="space-y-2">
                  <Label>Cantidad a reducir</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedUserBalance?.balance || 1000}
                    value={reduceFormData.certificatesCount}
                    onChange={(e) => setReduceFormData(prev => ({ 
                      ...prev, 
                      certificatesCount: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>

                {/* Razón */}
                <div className="space-y-2">
                  <Label>Razón de la reducción</Label>
                  <Textarea
                    placeholder="Explica por qué se reducen los certificados..."
                    value={reduceFormData.reason}
                    onChange={(e) => setReduceFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsReduceDialogOpen(false); resetReduceForm(); }}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReduceSubmit} 
                  disabled={loading || !reduceFormData.targetEmail || reduceFormData.certificatesCount <= 0 || !reduceFormData.reason}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reduciendo...
                    </>
                  ) : (
                    <>
                      <Minus className="mr-2 h-4 w-4" />
                      Reducir {reduceFormData.certificatesCount} certificados
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botón Asignar Certificados */}
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
