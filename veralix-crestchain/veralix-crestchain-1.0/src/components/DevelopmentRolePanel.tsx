import { useState } from 'react';
import { Wrench, Loader2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DevelopmentRolePanel() {
  const { role, changeRoleForTesting } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Solo mostrar en desarrollo
  if (!import.meta.env.DEV) {
    return null;
  }

  const handleRoleChange = async (newRole: 'admin' | 'joyero' | 'cliente') => {
    if (role === newRole) {
      toast.info('Ya tienes este rol');
      return;
    }

    setIsChanging(true);
    
    try {
      const result = await changeRoleForTesting(newRole);
      
      if (result?.error) {
        toast.error('Error al cambiar rol', {
          description: result.error.toString()
        });
        setIsChanging(false);
        return;
      }

      toast.success(`Cambiando a ${newRole}...`, {
        description: 'La página se recargará automáticamente'
      });

      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error changing role:', error);
      toast.error('Error al cambiar rol');
      setIsChanging(false);
    }
  };

  const getRoleBadgeVariant = (currentRole: string | null) => {
    switch (currentRole) {
      case 'admin':
        return 'destructive';
      case 'joyero':
        return 'gold';
      case 'cliente':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (roleValue: string | null) => {
    switch (roleValue) {
      case 'admin':
        return 'Admin';
      case 'joyero':
        return 'Joyero';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Sin rol';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          className="fixed bottom-24 right-4 z-50 gap-2 border-yellow-500 bg-yellow-50 text-yellow-900 shadow-lg hover:bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-100 dark:hover:bg-yellow-900"
        >
          <Wrench className="h-5 w-5" />
          <Badge variant={getRoleBadgeVariant(role)}>
            {getRoleLabel(role)}
          </Badge>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-600" />
            Modo Desarrollo - Cambio de Roles
          </DialogTitle>
          <DialogDescription>
            ⚠️ Esta función solo está disponible en desarrollo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
            <span className="text-sm font-medium">Rol Actual:</span>
            <Badge variant={getRoleBadgeVariant(role)} className="text-sm">
              {getRoleLabel(role)}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Selecciona un nuevo rol:
            </p>
            
            <div className="grid gap-2">
              <Button
                onClick={() => handleRoleChange('admin')}
                disabled={isChanging || role === 'admin'}
                variant={role === 'admin' ? 'secondary' : 'outline'}
                className="w-full justify-start gap-2"
              >
                {isChanging && role !== 'admin' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <Badge variant="destructive" className="text-xs">
                  Admin
                </Badge>
                <span className="text-sm">Administrador del Sistema</span>
              </Button>

              <Button
                onClick={() => handleRoleChange('joyero')}
                disabled={isChanging || role === 'joyero'}
                variant={role === 'joyero' ? 'secondary' : 'outline'}
                className="w-full justify-start gap-2"
              >
                {isChanging && role !== 'joyero' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <Badge variant="gold" className="text-xs">
                  Joyero
                </Badge>
                <span className="text-sm">Vendedor de Joyas</span>
              </Button>

              <Button
                onClick={() => handleRoleChange('cliente')}
                disabled={isChanging || role === 'cliente'}
                variant={role === 'cliente' ? 'secondary' : 'outline'}
                className="w-full justify-start gap-2"
              >
                {isChanging && role !== 'cliente' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <Badge variant="secondary" className="text-xs">
                  Cliente
                </Badge>
                <span className="text-sm">Comprador</span>
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              💡 <strong>Tip:</strong> Después del cambio, la página se recargará 
              automáticamente para aplicar el nuevo rol.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
