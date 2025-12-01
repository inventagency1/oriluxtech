import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface MaintenanceGuardProps {
  children: ReactNode;
}

const EXEMPT_ROUTES = [
  '/maintenance',
  '/login',
  '/admin',
  '/admin/login'
];

// Routes that start with these paths are exempt
const EXEMPT_ROUTE_PREFIXES = [
  '/verify/',
  '/reset-password'
];

export function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenanceMode();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both checks to complete
    if (maintenanceLoading || roleLoading) {
      console.log('🛡️ MaintenanceGuard: Still loading...', { maintenanceLoading, roleLoading });
      return;
    }

    const currentPath = location.pathname;
    
    // Check if current route is exempt
    const isExempt = EXEMPT_ROUTES.includes(currentPath) || 
                     EXEMPT_ROUTE_PREFIXES.some(prefix => currentPath.startsWith(prefix));

    console.log('🛡️ MaintenanceGuard: Checking access', {
      currentPath,
      isMaintenanceMode,
      isAdmin,
      isExempt,
      willRedirect: isMaintenanceMode && !isAdmin && !isExempt
    });

    // If in maintenance mode and not admin and not on exempt route
    if (isMaintenanceMode && !isAdmin && !isExempt) {
      console.log('🚫 MaintenanceGuard: Redirecting to maintenance page');
      navigate('/maintenance', { replace: true });
      return;
    }
    
    // If not in maintenance mode and on maintenance page
    if (!isMaintenanceMode && currentPath === '/maintenance') {
      console.log('✅ MaintenanceGuard: Redirecting away from maintenance page');
      navigate('/', { replace: true });
    }
  }, [isMaintenanceMode, isAdmin, location.pathname, navigate, maintenanceLoading, roleLoading]);

  // Show loading while checking
  if (maintenanceLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
