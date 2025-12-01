import { ReactNode } from 'react';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import { UserRole } from '@/hooks/useUserRole';
import { AccessDeniedAlert } from '@/components/ui/access-denied-alert';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: ReactNode;
  showWarning?: boolean;
  resourceId?: string;
}

export function RoleGuard({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallback,
  showWarning = false,
  resourceId
}: RoleGuardProps) {
  const { role, hasPermission, requirePermission } = useRoleValidation();

  // DEBUG: Log role verification
  console.log('🛡️ RoleGuard Check:', {
    currentRole: role,
    requiredRole,
    requiredPermission,
    hasAccess: requiredRole ? role === requiredRole : true,
    timestamp: new Date().toISOString()
  });

  // Check role-based access
  if (requiredRole && role !== requiredRole) {
    if (showWarning) {
      return (
        <AccessDeniedAlert 
          message={`Se requiere rol de ${requiredRole} para acceder a esta sección.`}
        />
      );
    }
    return fallback || null;
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasAccess = requirePermission(requiredPermission as any, resourceId);
    if (!hasAccess) {
      if (showWarning) {
        return (
          <AccessDeniedAlert 
            message="No tienes permisos para realizar esta acción."
          />
        );
      }
      return fallback || null;
    }
  }

  return <>{children}</>;
}