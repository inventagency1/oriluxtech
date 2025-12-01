import { useCallback } from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { useAudit } from '@/hooks/useAudit';

type Permission = 'create_jewelry' | 'manage_certificates' | 'view_all_audit' | 'transfer_certificates' | 'verify_certificates' | 'view_own_certificates' | 'admin_manage_users' | 'admin_manage_pricing' | 'admin_manage_system';

interface RolePermissions {
  joyero: Permission[];
  cliente: Permission[];
  admin: Permission[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  joyero: [
    'create_jewelry',
    'manage_certificates', 
    'view_all_audit',
    'verify_certificates'
  ],
  cliente: [
    'transfer_certificates',
    'verify_certificates',
    'view_own_certificates'
  ],
  admin: [
    'create_jewelry',
    'manage_certificates',
    'view_all_audit',
    'transfer_certificates',
    'verify_certificates',
    'view_own_certificates',
    'admin_manage_users',
    'admin_manage_pricing',
    'admin_manage_system'
  ]
};

export function useRoleValidation() {
  const { role, isJoyero, isCliente, isAdmin } = useUserRole();
  const { logAction } = useAudit();

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
  }, [role]);

  const requirePermission = useCallback((permission: Permission, resourceId?: string): boolean => {
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess) {
      // Log unauthorized access attempt
      logAction('unauthorized_access', 'system', resourceId, {
        attempted_permission: permission,
        current_role: role || 'none',
        message: `User attempted to access ${permission} without proper role`
      });
    }
    
    return hasAccess;
  }, [hasPermission, logAction, role]);

  const canCreateJewelry = useCallback(() => hasPermission('create_jewelry'), [hasPermission]);
  const canManageCertificates = useCallback(() => hasPermission('manage_certificates'), [hasPermission]);
  const canViewAllAudit = useCallback(() => hasPermission('view_all_audit'), [hasPermission]);
  const canTransferCertificates = useCallback(() => hasPermission('transfer_certificates'), [hasPermission]);
  const canVerifyCertificates = useCallback(() => hasPermission('verify_certificates'), [hasPermission]);
  const canViewOwnCertificates = useCallback(() => hasPermission('view_own_certificates'), [hasPermission]);
  const canManageUsers = useCallback(() => hasPermission('admin_manage_users'), [hasPermission]);
  const canManagePricing = useCallback(() => hasPermission('admin_manage_pricing'), [hasPermission]);
  const canManageSystem = useCallback(() => hasPermission('admin_manage_system'), [hasPermission]);

  return {
    role,
    isJoyero,
    isCliente,
    isAdmin,
    hasPermission,
    requirePermission,
    canCreateJewelry,
    canManageCertificates,
    canViewAllAudit,
    canTransferCertificates,
    canVerifyCertificates,
    canViewOwnCertificates,
    canManageUsers,
    canManagePricing,
    canManageSystem
  };
}