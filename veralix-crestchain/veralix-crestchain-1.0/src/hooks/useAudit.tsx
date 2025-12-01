import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type AuditAction = 
  | 'login' 
  | 'logout' 
  | 'role_change' 
  | 'jewelry_create' 
  | 'jewelry_update' 
  | 'jewelry_delete'
  | 'certificate_create' 
  | 'certificate_verify' 
  | 'certificate_transfer'
  | 'unauthorized_access'
  | 'profile_view'
  | 'certificates_view';

export type ResourceType = 
  | 'user' 
  | 'jewelry' 
  | 'certificate' 
  | 'profile'
  | 'system';

interface AuditDetails {
  [key: string]: any;
}

export function useAudit() {
  const { user } = useAuth();

  const logAction = useCallback(async (
    action: AuditAction,
    resourceType: ResourceType,
    resourceId?: string,
    details: AuditDetails = {}
  ) => {
    if (!user) return;

    try {
      // Get client info for audit trail
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();
      
      // Call the secure audit function
      const { error } = await supabase.rpc('log_audit_action', {
        _action: String(action),
        _resource_type: String(resourceType),
        _resource_id: resourceId || null,
        _details: {
          ...details,
          timestamp,
          user_email: user.email,
          browser: userAgent
        },
        _user_agent: userAgent
      });

      if (error) {
        console.error('Error logging audit action:', error);
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }, [user]);

  return {
    logAction
  };
}