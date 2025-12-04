import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RegistroJoyeria = () => {
  const [formData, setFormData] = useState({
    // Datos del negocio
    businessName: "",
    businessType: "",
    nit: "",
    registroCamara: "",
    // Datos de contacto
    contactName: "",
    email: "",
    phone: "",
    whatsapp: "",
    // Ubicación
    country: "Colombia",
    department: "",
    city: "",
    address: "",
    // Información adicional
    description: "",
    website: "",
    instagram: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar que el usuario esté autenticado y sea joyero
  useEffect(() => {
    if (!user && !roleLoading) {
      navigate('/register');
      return;
    }
    
    // Si ya tiene perfil de joyería completo, ir al dashboard
    if (role === 'joyero') {
      checkExistingProfile();
    }
  }, [user, role, roleLoading, navigate]);

  const checkExistingProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('business_name, tax_id')
      .eq('user_id', user.id)
      .single();
    
    // Si ya tiene datos de negocio, ir al dashboard
    if (data?.business_name && data?.tax_id) {
      navigate('/dashboard');
    }
  };

  // Pre-llenar email del usuario
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, contactName: user.user_metadata.full_name || '' }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre del negocio es obligatorio';
    }
    if (!formData.businessType) {
      newErrors.businessType = 'Selecciona el tipo de negocio';
    }
    if (!formData.nit.trim()) {
      newErrors.nit = 'El NIT o documento fiscal es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'El nombre de contacto es obligatorio';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es obligatorio para contacto con clientes';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    if (!user) return;

    setIsLoading(true);

    try {
      // Actualizar perfil con datos de la joyería
      // Usar fiscal_address para guardar datos adicionales como JSON
      const fiscalData = {
        registro_camara: formData.registroCamara,
        department: formData.department,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        profile_completed: true
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.contactName,
          business_name: formData.businessName,
          business_type: formData.businessType,
          tax_id: formData.nit,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          description: formData.description,
          website: formData.website,
          fiscal_address: fiscalData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast({
          title: "Error",
          description: "No se pudo guardar la información. Intenta de nuevo.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Limpiar localStorage
      localStorage.removeItem('postRegisterRedirect');
      localStorage.removeItem('pendingUserRole');

      toast({
        title: "¡Datos guardados!",
        description: "Ahora selecciona tu paquete de certificados para comenzar.",
      });

      // Marcar que viene del registro para mostrar mensaje especial en pricing
      localStorage.setItem('fromJewelerRegistration', 'true');

      // Redirigir a la página de compra de paquetes
      navigate('/pricing');

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <VeralixLogo size={40} />
            <span className="text-3xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent">
              Veralix
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading mb-2">Registro de Joyería</h1>
          <p className="text-muted-foreground">
            Completa los datos de tu negocio para comenzar a certificar
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    step > s ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-premium border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <><Building2 className="w-5 h-5 text-primary" /> Datos del Negocio</>}
              {step === 2 && <><User className="w-5 h-5 text-primary" /> Información de Contacto</>}
              {step === 3 && <><MapPin className="w-5 h-5 text-primary" /> Ubicación</>}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Información legal y fiscal de tu joyería"}
              {step === 2 && "Datos para que los clientes te contacten"}
              {step === 3 && "Dirección física de tu negocio"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Datos del Negocio */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio / Joyería *</Label>
                  <Input
                    id="businessName"
                    placeholder="Joyería El Diamante"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.businessName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de Negocio *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => handleInputChange("businessType", value)}
                  >
                    <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Joyería al por menor</SelectItem>
                      <SelectItem value="wholesale">Joyería al por mayor</SelectItem>
                      <SelectItem value="manufacturer">Fabricante / Taller</SelectItem>
                      <SelectItem value="artisan">Artesano independiente</SelectItem>
                      <SelectItem value="designer">Diseñador de joyas</SelectItem>
                      <SelectItem value="repair">Reparación y restauración</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.businessType}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-600 dark:text-amber-400">Documentos Fiscales</h4>
                      <p className="text-sm text-muted-foreground">
                        Estos datos son necesarios para la facturación y cumplimiento legal
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT / RUT / RFC *</Label>
                    <Input
                      id="nit"
                      placeholder="900.123.456-7"
                      value={formData.nit}
                      onChange={(e) => handleInputChange("nit", e.target.value)}
                      className={errors.nit ? "border-destructive" : ""}
                    />
                    {errors.nit && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.nit}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Número de identificación tributaria
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registroCamara">Registro Cámara de Comercio</Label>
                    <Input
                      id="registroCamara"
                      placeholder="Número de matrícula"
                      value={formData.registroCamara}
                      onChange={(e) => handleInputChange("registroCamara", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional pero recomendado
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Información de Contacto */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Nombre del Representante Legal *</Label>
                  <Input
                    id="contactName"
                    placeholder="Juan Pérez García"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange("contactName", e.target.value)}
                    className={errors.contactName ? "border-destructive" : ""}
                  />
                  {errors.contactName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.contactName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vinculado a tu cuenta de Google
                  </p>
                </div>

                <Separator />

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-600 dark:text-green-400">Contacto con Clientes</h4>
                      <p className="text-sm text-muted-foreground">
                        El WhatsApp es esencial para que los clientes te contacten desde el Marketplace
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono Fijo / Celular *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Business *</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+57 300 123 4567"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      className={errors.whatsapp ? "border-destructive" : ""}
                    />
                    {errors.whatsapp && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.whatsapp}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      placeholder="https://www.tujoyeria.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@tujoyeria"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Ubicación */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => handleInputChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Colombia">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="México">🇲🇽 México</SelectItem>
                      <SelectItem value="Argentina">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="Chile">🇨🇱 Chile</SelectItem>
                      <SelectItem value="Perú">🇵🇪 Perú</SelectItem>
                      <SelectItem value="Ecuador">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="España">🇪🇸 España</SelectItem>
                      <SelectItem value="Estados Unidos">🇺🇸 Estados Unidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento / Estado</Label>
                    <Input
                      id="department"
                      placeholder="Cundinamarca"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      placeholder="Bogotá"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección Completa *</Label>
                  <Input
                    id="address"
                    placeholder="Calle 123 # 45-67, Local 101, Centro Comercial..."
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.address}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del Negocio</Label>
                  <Textarea
                    id="description"
                    placeholder="Cuéntanos sobre tu joyería, especialidades, años de experiencia, tipos de joyas que manejas..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta descripción aparecerá en tu perfil del Marketplace
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Verificación de Datos</h4>
                      <p className="text-sm text-muted-foreground">
                        Al completar el registro, tus datos serán verificados por nuestro equipo para garantizar la autenticidad de tu negocio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  Anterior
                </Button>
              ) : (
                <div />
              )}
              
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-gradient-gold hover:shadow-gold">
                  Siguiente
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="bg-gradient-gold hover:shadow-gold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Completar Registro
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Tus datos están protegidos y solo se usarán para verificar tu negocio
        </p>
      </div>
    </div>
  );
};

export default RegistroJoyeria;
