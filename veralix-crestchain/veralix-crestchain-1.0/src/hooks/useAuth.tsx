import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MutationResult } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<MutationResult>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Usar dominio de producción en lugar de localhost
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/`
      : 'https://veralix.io/';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Registro exitoso!",
        description: "Por favor verifica tu email para continuar.",
      });

      // Send welcome email
      if (data.user) {
        setTimeout(async () => {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user!.id)
              .single();

            await supabase.functions.invoke('send-email', {
              body: {
                type: 'welcome',
                to: email,
                data: {
                  userName: fullName,
                  userEmail: email,
                  userRole: roleData?.role || 'cliente'
                }
              }
            });
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
          }
        }, 2000);
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error de inicio de sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido a Veralix!",
        description: "Has iniciado sesión exitosamente",
      });
    }

    return { error };
  };

  const signOut = async (): Promise<MutationResult> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    }
  };

  const signInWithGoogle = async () => {
    // Redirigir al dashboard - la lógica de setup-password se maneja allí si es necesario
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/dashboard`
      : 'https://veralix.io/dashboard';
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    return { error };
  };

  const signInWithGitHub = async () => {
    // Usar dominio de producción en lugar de localhost
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/dashboard`
      : 'https://veralix.io/dashboard';
      
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl
      }
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/reset-password`
      : 'https://veralix.io/reset-password';
    
    console.log('🔐 Iniciando resetPassword para:', email);
    console.log('📍 Redirect URL configurada:', redirectUrl);
    
    // Supabase enviará automáticamente el email usando el template personalizado
    // configurado en Auth Settings > Email Templates > "Reset Password"
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    
    if (error) {
      console.error('❌ Error al solicitar reset de contraseña:', error);
      
      // Detectar rate limit específicamente
      if (error.message.includes('rate limit') || 
          error.message.includes('over_email_send_rate_limit') || 
          error.message.includes('too many')) {
        toast({
          title: "Demasiados intentos",
          description: "Por favor espera 5-10 minutos antes de intentar de nuevo.",
          variant: "destructive",
          duration: 8000,
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return { error };
    }

    console.log('✅ Email de recuperación enviado vía Supabase Auth (con SMTP Resend)');
    console.log('📧 El email fue enviado desde noreply@veralix.io usando el template personalizado');

    toast({
      title: "Email enviado",
      description: "Revisa tu correo para restablecer tu contraseña",
    });

    return { error: null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}