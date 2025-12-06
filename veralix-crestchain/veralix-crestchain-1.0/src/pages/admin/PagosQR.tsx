import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Loader2, 
  Search,
  RefreshCw,
  Download,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PagoQR {
  id: string;
  user_id: string;
  referencia: string;
  monto: number;
  estado: 'pendiente' | 'en_revision' | 'aprobado' | 'rechazado';
  comprobante_url: string | null;
  detalles: {
    package_id?: string;
    package_name?: string;
    certificates_count?: number;
  };
  mensaje_admin: string | null;
  creado_en: string;
  actualizado_en: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function PagosQR() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPago, setSelectedPago] = useState<PagoQR | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [actionType, setActionType] = useState<'aprobar' | 'rechazar' | null>(null);

  // Fetch pagos
  const { data: pagos, isLoading, refetch } = useQuery({
    queryKey: ['pagos-qr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagos_qr')
        .select(`
          *,
          profiles:user_id (email, full_name)
        `)
        .order('creado_en', { ascending: false });
      
      if (error) throw error;
      return data as PagoQR[];
    }
  });

  // Mutation para actualizar estado
  const updatePagoMutation = useMutation({
    mutationFn: async ({ id, estado, mensaje }: { id: string; estado: string; mensaje: string }) => {
      const { error } = await supabase
        .from('pagos_qr')
        .update({ 
          estado,
          mensaje_admin: mensaje,
          aprobado_en: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;

      // Si se aprueba, asignar certificados
      if (estado === 'aprobado' && selectedPago) {
        const certificados = selectedPago.detalles?.certificates_count || 0;
        if (certificados > 0) {
          // Actualizar balance de certificados
          const { error: balanceError } = await supabase.rpc('increment_certificate_balance', {
            p_user_id: selectedPago.user_id,
            p_amount: certificados
          });
          
          if (balanceError) {
            console.error('Error al asignar certificados:', balanceError);
            // Intentar insertar directamente
            await supabase
              .from('certificate_balances')
              .upsert({
                user_id: selectedPago.user_id,
                available_certificates: certificados,
                total_purchased: certificados
              }, { onConflict: 'user_id' });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-qr'] });
      toast({
        title: actionType === 'aprobar' ? "Pago aprobado" : "Pago rechazado",
        description: actionType === 'aprobar' 
          ? "Los certificados han sido asignados al usuario"
          : "Se ha notificado al usuario",
      });
      setShowDialog(false);
      setSelectedPago(null);
      setMensaje('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la acción",
        variant: "destructive",
      });
    }
  });

  const handleAction = (pago: PagoQR, action: 'aprobar' | 'rechazar') => {
    setSelectedPago(pago);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (!selectedPago || !actionType) return;
    
    updatePagoMutation.mutate({
      id: selectedPago.id,
      estado: actionType === 'aprobar' ? 'aprobado' : 'rechazado',
      mensaje
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'en_revision':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Eye className="w-3 h-3 mr-1" />En revisión</Badge>;
      case 'aprobado':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'rechazado':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const filteredPagos = pagos?.filter(pago => 
    pago.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pago.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pago.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadComprobante = async (url: string) => {
    try {
      const { data } = await supabase.storage
        .from('comprobantes')
        .createSignedUrl(`pagos-qr/${url}`, 3600);
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el comprobante",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagos con QR Bancolombia</h1>
          <p className="text-muted-foreground">
            Gestiona y aprueba los pagos realizados por QR
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pagos?.filter(p => p.estado === 'pendiente' || p.estado === 'en_revision').length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">
                  {pagos?.filter(p => p.estado === 'aprobado').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rechazados</p>
                <p className="text-2xl font-bold text-red-600">
                  {pagos?.filter(p => p.estado === 'rechazado').length || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recaudado</p>
                <p className="text-2xl font-bold text-primary">
                  ${pagos?.filter(p => p.estado === 'aprobado').reduce((acc, p) => acc + p.monto, 0).toLocaleString('es-CO') || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por referencia, email o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Paquete</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay pagos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPagos?.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell className="font-mono text-sm">{pago.referencia}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pago.profiles?.full_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{pago.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{pago.detalles?.package_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">
                            {pago.detalles?.certificates_count} certificados
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${pago.monto.toLocaleString('es-CO')}
                      </TableCell>
                      <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(pago.creado_en), "dd MMM yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {pago.comprobante_url ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => downloadComprobante(pago.comprobante_url!)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin comprobante</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(pago.estado === 'pendiente' || pago.estado === 'en_revision') && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleAction(pago, 'aprobar')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleAction(pago, 'rechazar')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprobar' ? 'Aprobar Pago' : 'Rechazar Pago'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'aprobar' 
                ? `¿Confirmas que deseas aprobar el pago de ${selectedPago?.referencia}? Se asignarán ${selectedPago?.detalles?.certificates_count} certificados al usuario.`
                : `¿Confirmas que deseas rechazar el pago de ${selectedPago?.referencia}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Referencia:</span>
                <span className="font-mono">{selectedPago?.referencia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monto:</span>
                <span className="font-medium">${selectedPago?.monto.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usuario:</span>
                <span>{selectedPago?.profiles?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mensaje (opcional)</label>
              <Textarea
                placeholder={actionType === 'aprobar' 
                  ? "Ej: Pago verificado correctamente"
                  : "Ej: El comprobante no coincide con el monto"
                }
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={updatePagoMutation.isPending}
              className={actionType === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {updatePagoMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                actionType === 'aprobar' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
