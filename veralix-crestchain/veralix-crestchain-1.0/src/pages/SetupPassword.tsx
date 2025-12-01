import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Eye, EyeOff, KeyRound, ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SetupPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewOAuthUser, setIsNewOAuthUser] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        // Si no hay usuario, redirigir al login
        navigate('/login');
        return;
      }

      // Verificar si el usuario viene de OAuth (Google/GitHub)
      const provider = user.app_metadata?.provider;
      const isOAuth = provider === 'google' || provider === 'github';
      
      // Verificar si ya configuró contraseña previamente (en metadata)
      const passwordConfigured = user.user_metadata?.password_configured;
      
      // También verificar si tiene WhatsApp en metadata (indica que ya pasó por setup)
      const hasWhatsappInMetadata = !!user.user_metadata?.whatsapp;
      
      console.log('🔍 User check:', { 
        provider, 
        isOAuth, 
        passwordConfigured,
        hasWhatsappInMetadata,
        email: user.email
      });

      // Si ya configuró contraseña O ya tiene whatsapp, ir al dashboard
      if (passwordConfigured || hasWhatsappInMetadata) {
        console.log('✅ Usuario ya configurado, redirigiendo al dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }

      // Verificar también en el perfil de Supabase si tiene WhatsApp
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp, phone')
          .eq('id', user.id)
          .single();
        
        const profileData = profile as { whatsapp?: string; phone?: string } | null;
        
        if (profileData?.whatsapp || profileData?.phone) {
          console.log('✅ Usuario tiene WhatsApp en perfil, marcando como configurado');
          // Marcar como configurado para futuras visitas
          await supabase.auth.updateUser({
            data: { password_configured: true, whatsapp: profileData.whatsapp || profileData.phone }
          });
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.log('⚠️ Error verificando perfil:', error);
      }

      // Si es OAuth y NO ha configurado nada, mostrar la página
      if (isOAuth) {
        setIsNewOAuthUser(true);
        toast({
          title: "¡Cuenta creada exitosamente! 🎉",
          description: "Configura una contraseña para acceder también con email",
        });
      } else {
        // Si no es OAuth, no necesita configurar contraseña aquí
        navigate('/dashboard', { replace: true });
      }
    };

    checkUserStatus();
  }, [user, navigate, toast]);

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar WhatsApp (obligatorio)
    if (!whatsapp) {
      toast({
        title: "WhatsApp requerido",
        description: "Por favor ingresa tu número de WhatsApp para contacto",
        variant: "destructive",
      });
      return;
    }

    // Validar formato de WhatsApp (solo números, mínimo 10 dígitos)
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    if (cleanWhatsapp.length < 10) {
      toast({
        title: "Número inválido",
        description: "Ingresa un número de WhatsApp válido con código de país",
        variant: "destructive",
      });
      return;
    }

    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos de contraseña",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Actualizar contraseña
      const { error: passwordError } = await supabase.auth.updateUser({
        password: password,
      });

      if (passwordError) {
        toast({
          title: "Error",
          description: passwordError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // 2. Guardar WhatsApp en el perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          whatsapp: cleanWhatsapp,
          phone: cleanWhatsapp 
        })
        .eq('id', user?.id);

      if (profileError) {
        console.error('Error guardando WhatsApp:', profileError);
        // No fallar por esto, continuar
      }

      // 3. Marcar que ya configuró contraseña
      await supabase.auth.updateUser({
        data: { 
          password_configured: true,
          whatsapp: cleanWhatsapp
        }
      });

      toast({
        title: "¡Cuenta configurada! 🎉",
        description: "Tu contraseña y WhatsApp han sido guardados",
      });
      
      // Redirigir al dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al configurar la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Configuración omitida",
      description: "Podrás configurar tu contraseña más tarde desde tu perfil",
    });
    navigate("/dashboard");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">¡Bienvenido a Veralix!</CardTitle>
            <CardDescription className="text-base">
              {user.user_metadata?.full_name && (
                <span className="block font-medium text-foreground mb-2">
                  Hola, {user.user_metadata.full_name.split(' ')[0]} 👋
                </span>
              )}
              Completa tu perfil para empezar a vender en el marketplace
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Beneficios */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Completa tu perfil para:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Recibir contactos de compradores por WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Acceder con email y contraseña
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Mayor seguridad para tu cuenta
              </li>
            </ul>
          </div>

          <form onSubmit={handleSetupPassword} className="space-y-4">
            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                WhatsApp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="Ej: +57 300 123 4567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Los compradores te contactarán por este número
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-3">Configura tu contraseña</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Completar configuración"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
          >
            Omitir por ahora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Siempre podrás configurar o cambiar tu contraseña desde la configuración de tu cuenta
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
