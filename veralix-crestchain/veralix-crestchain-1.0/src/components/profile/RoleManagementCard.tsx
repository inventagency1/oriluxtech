import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Crown, UserCheck, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export function RoleManagementCard() {
  const { role, isAdmin } = useUserRole();
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestedRole, setRequestedRole] = useState<'joyero' | 'cliente'>('joyero');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequest();
  }, []);

  const fetchPendingRequest = async () => {
    const { data } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('status', 'pending')
      .maybeSingle();
    
    setPendingRequest(data);
  };

  const handleRequestRoleChange = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('request_role_change', {
        _requested_role: requestedRole,
        _reason: reason
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (result.success) {
        toast.success(result.message || "Solicitud enviada");
        setIsDialogOpen(false);
        setReason('');
        fetchPendingRequest();
      } else {
        toast.error(result.error || "Error al enviar solicitud");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'admin': return <Shield className="w-5 h-5" />;
      case 'joyero': return <Crown className="w-5 h-5" />;
      case 'cliente': return <UserCheck className="w-5 h-5" />;
      default: return null;
    }
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case 'admin': return 'destructive';
      case 'joyero': return 'default';
      case 'cliente': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (roleType: string) => {
    switch (roleType) {
      case 'admin': return 'Administrador';
      case 'joyero': return 'Joyería';
      case 'cliente': return 'Cliente';
      default: return 'Sin rol';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getRoleIcon(role || '')}
          Rol de Usuario
        </CardTitle>
        <CardDescription>
          Tu rol actual determina qué acciones puedes realizar en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rol Actual */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm font-medium">Rol Actual</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getRoleColor(role || '')} className="text-base">
                {getRoleLabel(role || '')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Solicitud Pendiente */}
        {pendingRequest && (
          <div className="border border-yellow-500/50 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Solicitud Pendiente</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Solicitaste cambiar a <strong>{getRoleLabel(pendingRequest.requested_role)}</strong>
            </p>
            {pendingRequest.reason && (
              <p className="text-xs text-muted-foreground mt-1">
                Razón: {pendingRequest.reason}
              </p>
            )}
          </div>
        )}

        {/* Botón Solicitar Cambio */}
        {!isAdmin && !pendingRequest && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Solicitar Cambio de Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Cambio de Rol</DialogTitle>
                <DialogDescription>
                  Un administrador revisará tu solicitud y la aprobará o rechazará
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Rol Solicitado</Label>
                  <RadioGroup value={requestedRole} onValueChange={(v) => setRequestedRole(v as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="joyero" id="joyero" />
                      <Label htmlFor="joyero" className="flex items-center gap-2 cursor-pointer">
                        <Crown className="w-4 h-4" />
                        Joyería
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cliente" id="cliente" />
                      <Label htmlFor="cliente" className="flex items-center gap-2 cursor-pointer">
                        <UserCheck className="w-4 h-4" />
                        Cliente
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Razón de la Solicitud</Label>
                  <Textarea
                    placeholder="Explica por qué necesitas cambiar de rol..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleRequestRoleChange} 
                  disabled={loading || !reason.trim()}
                  className="w-full"
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Mensaje para Admins */}
        {isAdmin && (
          <div className="text-sm text-muted-foreground bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Como administrador, gestiona roles desde el Panel de Administración
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
