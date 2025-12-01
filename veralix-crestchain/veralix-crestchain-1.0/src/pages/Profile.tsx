import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Crown, 
  Settings,
  Bell,
  Shield,
  Save,
  Lock,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { PasswordChange } from "@/components/profile/PasswordChange";
import { TokenBalance } from "@/components/TokenBalance";
import { validateWhatsAppNumber, COUNTRY_CODES } from "@/utils/whatsappHelper";
import type { ProfileData } from "@/types";

const Profile = () => {
  const { user } = useAuth();
  const { role, isJoyero } = useUserRole();
  const { toast } = useToast();
  const { autoCompleteTask } = useOnboarding();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [whatsappError, setWhatsappError] = useState<string>('');
  
  const [profileData, setProfileData] = useState({
    businessName: "",
    contactName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    country: "Colombia",
    businessType: "",
    description: "",
    website: "",
    taxId: "",
    avatarUrl: "",
    fiscalTaxId: "",
    taxRegime: "simplified",
    fiscalAddress: {
      street: "",
      city: "",
      department: "",
      postalCode: ""
    }
  });

  const [stats, setStats] = useState({
    memberSince: "",
    totalCertifications: 0,
    currentPlan: "Free", 
    nextBilling: ""
  });

  const [notifications, setNotifications] = useState({
    newCertifications: true,
    priceAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    monthlyReport: true
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData(prev => ({
          ...prev,
          businessName: data.business_name || "",
          contactName: data.full_name || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "Colombia",
          businessType: data.business_type || "",
          description: data.description || "",
          website: data.website || "",
          taxId: data.tax_id || "",
          avatarUrl: data.avatar_url || ""
        }));

        setStats({
          memberSince: new Date(data.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
          }),
          totalCertifications: 0,
          currentPlan: "Free",
          nextBilling: ""
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validar WhatsApp antes de guardar
    if (profileData.phone) {
      const validation = validateWhatsAppNumber(profileData.phone, profileData.country);
      if (!validation.isValid) {
        setWhatsappError(validation.error || 'Número inválido');
        toast({
          title: "Error de validación",
          description: validation.error || 'El número de WhatsApp no es válido',
          variant: "destructive",
        });
        return;
      }
      setWhatsappError('');
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            full_name: profileData.contactName,
            email: profileData.email,
            business_name: profileData.businessName,
            phone: profileData.phone,
            address: profileData.address,
            city: profileData.city,
            country: profileData.country,
            business_type: profileData.businessType,
            description: profileData.description,
            website: profileData.website,
            tax_id: profileData.taxId
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Profile save error:', error);
        throw error;
      }

      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      // Auto-complete onboarding task
      await autoCompleteTask('profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setProfileData(prev => ({ ...prev, avatarUrl: url }));
  };

  if (dataLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
              <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
            </div>
            
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isLoading}
              size="lg"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card className="shadow-veralix-premium border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <AvatarUpload 
                      currentAvatarUrl={profileData.avatarUrl}
                      userId={user?.id || ''}
                      userName={profileData.contactName}
                      onAvatarUpdate={handleAvatarUpdate}
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{profileData.contactName || 'Usuario'}</h3>
                      <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      {role && (
                        <Badge variant="outline" className="mt-2">
                          <Crown className="w-3 h-3 mr-1" />
                          {role === 'joyero' ? 'Joyero' : role === 'cliente' ? 'Cliente' : 'Admin'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Miembro desde</span>
                      <span className="font-medium">{stats.memberSince}</span>
                    </div>
                    {isJoyero && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Certificaciones</span>
                        <span className="font-medium">{stats.totalCertifications}</span>
                      </div>
                    )}
                  </div>

                  {isJoyero && (
                    <div className="mt-6">
                      <TokenBalance />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Shield className="w-4 h-4 mr-2" />
                    Seguridad
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <Bell className="w-4 h-4 mr-2" />
                    Notificaciones
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  {/* Business Info */}
                  <Card className="shadow-veralix-premium border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Información del Negocio
                      </CardTitle>
                      <CardDescription>
                        Detalles de tu empresa o marca personal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessName">Nombre del Negocio</Label>
                          <Input
                            id="businessName"
                            value={profileData.businessName}
                            onChange={(e) => setProfileData(prev => ({...prev, businessName: e.target.value}))}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessType">Tipo de Negocio</Label>
                          <Input
                            id="businessType"
                            value={profileData.businessType}
                            onChange={(e) => setProfileData(prev => ({...prev, businessType: e.target.value}))}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={profileData.description}
                          onChange={(e) => setProfileData(prev => ({...prev, description: e.target.value}))}
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card className="shadow-veralix-premium border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Información de Contacto
                      </CardTitle>
                      <CardDescription>
                        Cómo los clientes pueden contactarte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Nombre de Contacto</Label>
                          <Input
                            id="contactName"
                            value={profileData.contactName}
                            onChange={(e) => setProfileData(prev => ({...prev, contactName: e.target.value}))}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country" className="flex items-center gap-2">
                            País {role === 'joyero' && <span className="text-destructive">*</span>}
                          </Label>
                          <Select
                            value={profileData.country}
                            onValueChange={(value) => {
                              setProfileData(prev => ({ ...prev, country: value }));
                              if (profileData.phone) {
                                const validation = validateWhatsAppNumber(profileData.phone, value);
                                setWhatsappError(validation.isValid ? '' : (validation.error || ''));
                              }
                            }}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(COUNTRY_CODES).map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country} (+{COUNTRY_CODES[country]})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Número de WhatsApp {role === 'joyero' && <span className="text-destructive">*</span>}
                          </Label>
                          <Input
                            id="phone"
                            placeholder="Ej: 3001234567"
                            value={profileData.phone}
                            onChange={(e) => {
                              const value = e.target.value;
                              setProfileData(prev => ({ ...prev, phone: value }));
                              if (value && profileData.country) {
                                const validation = validateWhatsAppNumber(value, profileData.country);
                                setWhatsappError(validation.isValid ? '' : (validation.error || ''));
                              } else {
                                setWhatsappError('');
                              }
                            }}
                            disabled={!isEditing}
                            className={whatsappError ? 'border-destructive' : ''}
                          />
                          {whatsappError && (
                            <p className="text-sm text-destructive">{whatsappError}</p>
                          )}
                          {role === 'joyero' && (
                            <p className="text-xs text-muted-foreground">
                              Los clientes te contactarán por este número cuando compren tus productos
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className="shadow-veralix-premium border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Ubicación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Dirección</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData(prev => ({...prev, address: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData(prev => ({...prev, city: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Sitio Web</Label>
                        <Input
                          id="website"
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({...prev, website: e.target.value}))}
                          disabled={!isEditing}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <PasswordChange />
                  
                  <Card className="shadow-veralix-premium border-border/50">
                    <CardHeader>
                      <CardTitle>Autenticación de Dos Factores</CardTitle>
                      <CardDescription>
                        Añade una capa extra de seguridad a tu cuenta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Configurar 2FA (Próximamente)
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card className="shadow-veralix-premium border-border/50">
                    <CardHeader>
                      <CardTitle>Preferencias de Notificación</CardTitle>
                      <CardDescription>
                        Elige qué notificaciones deseas recibir
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Nuevas Certificaciones</Label>
                          <p className="text-sm text-muted-foreground">
                            Notificarme cuando se genere un nuevo certificado
                          </p>
                        </div>
                        <Switch 
                          checked={notifications.newCertifications}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({...prev, newCertifications: checked}))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Alertas de Seguridad</Label>
                          <p className="text-sm text-muted-foreground">
                            Actividad sospechosa o cambios de seguridad
                          </p>
                        </div>
                        <Switch 
                          checked={notifications.securityAlerts}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({...prev, securityAlerts: checked}))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Emails de Marketing</Label>
                          <p className="text-sm text-muted-foreground">
                            Ofertas especiales y novedades
                          </p>
                        </div>
                        <Switch 
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({...prev, marketingEmails: checked}))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Reporte Mensual</Label>
                          <p className="text-sm text-muted-foreground">
                            Resumen de actividad y estadísticas
                          </p>
                        </div>
                        <Switch 
                          checked={notifications.monthlyReport}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({...prev, monthlyReport: checked}))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
