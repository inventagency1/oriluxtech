import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Gem, Building, Mail, Lock, User, Phone, MapPin, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { validateWhatsAppNumber } from "@/utils/whatsappHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "Colombia",
    city: "",
    address: "",
    businessType: "",
    description: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithGitHub, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar teléfono en tiempo real
    if (field === 'phone') {
      const validation = validateWhatsAppNumber(value, formData.country);
      setPhoneError(validation.isValid ? "" : validation.error || "");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Validar WhatsApp antes de enviar
    const phoneValidation = validateWhatsAppNumber(formData.phone, formData.country);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || "Número de WhatsApp inválido");
      return;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      setPhoneError("El número de WhatsApp es obligatorio");
      return;
    }

    setIsLoading(true);

    const fullName = `${formData.contactName} - ${formData.businessName}`;
    const { error } = await signUp(formData.email, formData.password, fullName);
    
    if (!error) {
      // User will be redirected after email verification
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  const handleGitHubSignUp = async () => {
    setIsLoading(true);
    await signInWithGitHub();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link to="/" className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-fast">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <VeralixLogo size={32} className="sm:w-10 sm:h-10" />
            <span className="text-2xl sm:text-3xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent">
              Veralix
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Registra tu joyería y comienza a certificar
          </p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-premium border-border/50">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-heading">Crear Cuenta</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Completa el formulario para registrar tu joyería
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
              {/* Business Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold font-heading flex items-center">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                  Información del Negocio
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre de la Joyería *</Label>
                    <Input
                      id="businessName"
                      type="text"
                      autoComplete="organization"
                      placeholder="Joyería El Diamante"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      required
                      aria-label="Nombre de la joyería"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Tipo de Negocio *</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Joyería al por menor</SelectItem>
                        <SelectItem value="wholesale">Joyería al por mayor</SelectItem>
                        <SelectItem value="manufacturer">Fabricante</SelectItem>
                        <SelectItem value="artisan">Artesano independiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del Negocio</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe tu joyería, especialidades, historia..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold font-heading flex items-center">
                   <User className="w-5 h-5 mr-2 text-primary" />
                   Información de Contacto
                 </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nombre de Contacto *</Label>
                    <Input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      placeholder="Juan Pérez"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      required
                      aria-label="Nombre de contacto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="contacto@joyeria.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                        required
                        aria-label="Correo electrónico"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* WhatsApp Section - REQUIRED */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold font-heading text-primary mb-1">
                      WhatsApp Obligatorio
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tu número de WhatsApp es esencial para que los clientes te contacten desde el Marketplace y el asistente de ventas IA.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleInputChange("country", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Colombia">🇨🇴 Colombia (+57)</SelectItem>
                        <SelectItem value="México">🇲🇽 México (+52)</SelectItem>
                        <SelectItem value="Argentina">🇦🇷 Argentina (+54)</SelectItem>
                        <SelectItem value="Chile">🇨🇱 Chile (+56)</SelectItem>
                        <SelectItem value="Perú">🇵🇪 Perú (+51)</SelectItem>
                        <SelectItem value="Ecuador">🇪🇨 Ecuador (+593)</SelectItem>
                        <SelectItem value="España">🇪🇸 España (+34)</SelectItem>
                        <SelectItem value="Estados Unidos">🇺🇸 Estados Unidos (+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Número de WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="3001234567"
                      value={formData.phone}
                      onChange={(e) => {
                        const cleanNumber = e.target.value.replace(/\D/g, '');
                        handleInputChange("phone", cleanNumber);
                      }}
                      className={phoneError ? "border-destructive" : ""}
                      required
                      aria-label="Número de WhatsApp"
                    />
                    {phoneError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {phoneError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Solo números, sin espacios ni caracteres especiales
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-heading flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Ubicación
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      placeholder="Bogotá"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      type="text"
                      autoComplete="street-address"
                      placeholder="Calle 123 # 45-67"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      aria-label="Dirección"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Security */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold font-heading flex items-center">
                   <Lock className="w-5 h-5 mr-2 text-primary" />
                   Seguridad
                 </h3>
                
                 <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      minLength={8}
                      aria-label="Contraseña"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      minLength={8}
                      aria-label="Confirmar contraseña"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-gold hover:shadow-gold transition-premium min-h-[48px] text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-3">
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleGitHubSignUp}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continuar con GitHub
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary-dark transition-fast font-medium"
              >
                Iniciar Sesión
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Al registrarte, aceptas nuestros{" "}
          <Link to="/terms" className="text-primary hover:text-primary-dark transition-fast">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link to="/privacy" className="text-primary hover:text-primary-dark transition-fast">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;