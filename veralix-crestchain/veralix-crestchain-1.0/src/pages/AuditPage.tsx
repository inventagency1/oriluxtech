import { AuditLog } from '@/components/AuditLog';
import { RoleGuard } from '@/components/RoleGuard';
import { AppLayout } from '@/components/layout/AppLayout';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuditPage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading mb-2">Auditoría</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Registro completo de acciones del sistema
          </p>
        </div>
        
        <RoleGuard 
          requiredPermission="view_audit_logs"
          showWarning={true}
          fallback={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
              <p className="text-muted-foreground mb-6">No tienes permisos para ver los registros de auditoría del sistema.</p>
              <Button asChild variant="outline">
                <a href="/dashboard">Volver al Dashboard</a>
              </Button>
            </div>
          }
        >
          <AuditLog />
        </RoleGuard>
      </div>
    </AppLayout>
  );
};

export default AuditPage;