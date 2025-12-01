import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, Building, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JewelryAccount {
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  account_status: string;
  created_at: string;
}

export function JewelryApprovalPanel() {
  const [accounts, setAccounts] = useState<JewelryAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<JewelryAccount | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedAccount) return;

    try {
      const { data, error } = await supabase.rpc('approve_jewelry_account', {
        _user_id: selectedAccount.user_id,
        _notes: notes || null
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string };
      if (result.success) {
        toast.success(result.message || "Cuenta aprobada");
        fetchAccounts();
        closeDialog();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedAccount || !notes.trim()) {
      toast.error("Debes proporcionar una razón para el rechazo");
      return;
    }

    try {
      const { data, error } = await supabase.rpc('reject_jewelry_account', {
        _user_id: selectedAccount.user_id,
        _rejection_reason: notes
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string };
      if (result.success) {
        toast.success(result.message || "Cuenta rechazada");
        fetchAccounts();
        closeDialog();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openDialog = (account: JewelryAccount, type: 'approve' | 'reject') => {
    setSelectedAccount(account);
    setActionType(type);
    setNotes('');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAccount(null);
    setActionType(null);
    setNotes('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aprobación de Joyerías</CardTitle>
          <CardDescription>Cargando solicitudes pendientes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Joyerías Pendientes de Aprobación
          </CardTitle>
          <CardDescription>
            {accounts.length} {accounts.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay solicitudes pendientes de aprobación
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joyería</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{account.business_name || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{account.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {account.email}
                        </p>
                        {account.phone && (
                          <p className="text-muted-foreground">{account.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.city && account.country && (
                        <p className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {account.city}, {account.country}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(account.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10">
                        Pendiente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => openDialog(account, 'approve')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => openDialog(account, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprobar Cuenta' : 'Rechazar Cuenta'}
            </DialogTitle>
            <DialogDescription>
              {selectedAccount?.business_name} - {selectedAccount?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>
                {actionType === 'approve' ? 'Notas (opcional)' : 'Razón del rechazo *'}
              </Label>
              <Textarea
                placeholder={
                  actionType === 'approve' 
                    ? 'Agrega notas sobre la aprobación...'
                    : 'Explica la razón del rechazo...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            {actionType === 'approve' ? (
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <Check className="w-4 h-4 mr-2" />
                Aprobar
              </Button>
            ) : (
              <Button 
                onClick={handleReject} 
                disabled={!notes.trim()}
                variant="destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
