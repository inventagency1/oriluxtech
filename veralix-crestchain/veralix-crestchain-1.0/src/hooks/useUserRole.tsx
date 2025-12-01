import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'joyero' | 'cliente' | 'admin' | null;

// Key para persistir el rol simulado en localStorage
const SIMULATED_ROLE_KEY = 'veralix_admin_simulated_role';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Estado para rol simulado (solo para admins en testing)
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(() => {
    // Recuperar rol simulado de localStorage al iniciar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIMULATED_ROLE_KEY);
      return saved as UserRole;
    }
    return null;
  });

  useEffect(() => {
    console.log('🔐 useUserRole: User changed:', user?.id, user?.email);
    
    if (!user) {
      console.log('🔐 useUserRole: No user, setting role to null');
      setRole(null);
      setLoading(false);
      setInitialCheckDone(true);
      return;
    }

    const fetchUserRole = async () => {
      try {
        console.log('🔐 useUserRole: Fetching role for user:', user.id, user.email);
        setLoading(true);

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('🔐 useUserRole: Query result:', { 
          data, 
          error,
          userId: user.id,
          userEmail: user.email,
          roleFound: data?.role || 'NONE'
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          const userRole = data?.role || null;
          console.log('useUserRole: Setting role to:', userRole);
          setRole(userRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } finally {
        setLoading(false);
        setInitialCheckDone(true);
      }
    };

    fetchUserRole();
  }, [user]);

  const updateRole = async (newRole: 'joyero' | 'cliente' | 'admin') => {
    if (!user) return { error: 'No user found' };

    try {
      // NOTA: Esta función ahora solo permite a admins cambiar roles directamente
      // Los usuarios deben solicitar cambios de rol a través de request_role_change
      const { data, error } = await supabase.rpc('admin_change_user_role', {
        _target_user_id: user.id,
        _new_role: newRole
      });

      if (error) {
        return { error };
      }

      // Parse the JSON response
      const result = data as { success: boolean; error?: string; new_role?: string };
      
      if (!result.success) {
        return { error: result.error || 'Role change failed' };
      }

      setRole(newRole);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // DESARROLLO: Función para cambiar roles durante testing
  // Solo debe usarse en modo desarrollo
  const changeRoleForTesting = async (newRole: 'joyero' | 'cliente' | 'admin') => {
    if (!user) return { error: 'No user found' };
    
    // Extra protection: solo permitir en desarrollo
    if (!import.meta.env.DEV) {
      console.warn('⚠️ changeRoleForTesting solo está disponible en desarrollo');
      return { error: 'Function not available in production' };
    }

    try {
      console.log('🔧 Testing role change:', { userId: user.id, newRole });
      
      const { data, error } = await supabase.rpc('testing_change_role', {
        _user_id: user.id,
        _new_role: newRole
      });

      if (error) {
        console.error('Testing role change error:', error);
        return { error };
      }

      console.log('✅ Testing role change result:', data);

      // Refetch inmediatamente para actualizar el estado local
      await refetchRole();
      
      return { error: null };
    } catch (error) {
      console.error('Testing role change exception:', error);
      return { error };
    }
  };

  // Add a manual refresh function
  const refetchRole = async () => {
    if (!user) return;
    
    console.log('useUserRole: Manual refetch for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('useUserRole: Manual refetch result:', { data, error });

      if (!error) {
        const userRole = data?.role || null;
        console.log('useUserRole: Manual refetch setting role to:', userRole);
        setRole(userRole);
      }
    } catch (error) {
      console.error('Error in manual refetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ADMIN ROLE SIMULATION SYSTEM
  // Permite a admins simular otros roles para testing
  // ============================================
  
  // Función para que admins simulen otro rol
  const simulateRole = (newRole: UserRole) => {
    if (role !== 'admin') {
      console.warn('⚠️ Solo admins pueden simular roles');
      return;
    }
    
    console.log('🎭 Admin simulando rol:', newRole);
    setSimulatedRole(newRole);
    
    // Persistir en localStorage
    if (newRole) {
      localStorage.setItem(SIMULATED_ROLE_KEY, newRole);
    } else {
      localStorage.removeItem(SIMULATED_ROLE_KEY);
    }
  };
  
  // Función para volver al rol real de admin
  const clearSimulatedRole = () => {
    console.log('🎭 Volviendo a rol real de admin');
    setSimulatedRole(null);
    localStorage.removeItem(SIMULATED_ROLE_KEY);
  };
  
  // El rol efectivo es el simulado (si existe y es admin) o el real
  const effectiveRole = (role === 'admin' && simulatedRole) ? simulatedRole : role;
  
  // Verificar si está en modo simulación
  const isSimulating = role === 'admin' && simulatedRole !== null;

  return {
    // Rol real del usuario (siempre el de la DB)
    role,
    // Rol efectivo (puede ser simulado si es admin)
    effectiveRole,
    // Estado de simulación
    simulatedRole,
    isSimulating,
    simulateRole,
    clearSimulatedRole,
    // Loading y funciones existentes
    loading: loading || !initialCheckDone,
    updateRole,
    refetchRole,
    changeRoleForTesting,
    // Verificaciones basadas en el rol EFECTIVO (para que la simulación funcione)
    isJoyero: effectiveRole === 'joyero' || effectiveRole === 'admin',
    isCliente: effectiveRole === 'cliente',
    isAdmin: effectiveRole === 'admin',
    // El rol real de admin (para mostrar el switcher)
    isRealAdmin: role === 'admin',
    // Helper para verificar si puede acceder a funciones de joyero
    canAccessJoyeroFeatures: effectiveRole === 'joyero' || effectiveRole === 'admin'
  };
}