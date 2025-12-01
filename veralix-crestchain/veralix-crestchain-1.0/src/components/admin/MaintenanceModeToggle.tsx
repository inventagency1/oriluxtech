import { useState } from 'react';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MaintenanceModeToggle() {
  const { isMaintenanceMode, maintenanceData, loading, enableMaintenanceMode, disableMaintenanceMode, updateMaintenanceMessage } = useMaintenanceMode();
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState(maintenanceData?.message || 'Estamos realizando mejoras en Veralix. Vuelve pronto.');
  const [estimatedEnd, setEstimatedEnd] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    if (isMaintenanceMode) {
      // Desactivar directamente
      setIsUpdating(true);
      await disableMaintenanceMode();
      setIsUpdating(false);
    } else {
      // Mostrar diálogo de confirmación para activar
      setShowDialog(true);
    }
  };

  const handleConfirmActivation = async () => {
    setIsUpdating(true);
    await enableMaintenanceMode(message, estimatedEnd || undefined);
    setShowDialog(false);
    setIsUpdating(false);
  };

  const handleUpdateMessage = async () => {
    setIsUpdating(true);
    await updateMaintenanceMessage(message, estimatedEnd || undefined);
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Modo Mantenimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Modo Mantenimiento
              </CardTitle>
              <CardDescription>
                Activa o desactiva el modo mantenimiento del sitio
              </CardDescription>
            </div>
            {isMaintenanceMode && (
              <Badge variant="destructive" className="animate-pulse">
                Activo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="maintenance-toggle" className="text-base font-semibold">
                {isMaintenanceMode ? '🔴 Mantenimiento Activo' : '🟢 Sistema Operativo'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isMaintenanceMode 
                  ? 'Los usuarios ven la página de mantenimiento' 
                  : 'El sitio está funcionando normalmente'}
              </p>
            </div>
            <Switch
              id="maintenance-toggle"
              checked={isMaintenanceMode}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
            />
          </div>

          {/* Message Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-message">
                Mensaje para usuarios
              </Label>
              <Textarea
                id="maintenance-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensaje que verán los usuarios durante el mantenimiento"
                rows={3}
                disabled={!isMaintenanceMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated-end" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Fecha estimada de fin (opcional)
              </Label>
              <Input
                id="estimated-end"
                type="datetime-local"
                value={estimatedEnd}
                onChange={(e) => setEstimatedEnd(e.target.value)}
                disabled={!isMaintenanceMode}
              />
            </div>

            {isMaintenanceMode && (
              <Button
                onClick={handleUpdateMessage}
                disabled={isUpdating}
                variant="outline"
                className="w-full"
              >
                Actualizar mensaje
              </Button>
            )}
          </div>

          {/* Warning */}
          {isMaintenanceMode && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">El sitio está en mantenimiento</p>
                <p className="text-sm text-muted-foreground">
                  Los usuarios no pueden acceder al sitio. Solo los administradores tienen acceso completo.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Activar modo mantenimiento?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Esto mostrará la página de mantenimiento a todos los usuarios (excepto administradores).</p>
              <p className="font-semibold">Los usuarios no podrán acceder al sitio hasta que desactives este modo.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmActivation}
              disabled={isUpdating}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isUpdating ? 'Activando...' : 'Sí, activar mantenimiento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
