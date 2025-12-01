import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Plus, 
  Users, 
  Clock, 
  TrendingUp, 
  Settings,
  PlayCircle,
  PauseCircle,
  StopCircle,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRoleValidation } from "@/hooks/useRoleValidation";
import { AccessDeniedAlert } from "@/components/ui/access-denied-alert";
import { supabase } from "@/integrations/supabase/client";
import { useAirdrop } from "@/hooks/useAirdrop";

const Airdrop = () => {
  console.log('Airdrop component starting to render');
  const { user } = useAuth();
  const { toast } = useToast();
  const { role } = useRoleValidation();
  console.log('Airdrop component calling useAirdrop hook');
  const { airdrops, loading, createAirdrop, distributeAirdrop, toggleAirdropStatus, canDistributeAirdrop, refetch } = useAirdrop();
  console.log('Airdrop component useAirdrop hook completed');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tokenAmount: '',
    totalRecipients: '',
    frequencyHours: '24',
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalAirdrops: 0,
    activeAirdrops: 0,
    totalDistributed: 0,
    totalUsers: 0
  });

  console.log('Airdrop component state initialized');

  useEffect(() => {
    loadStats();
  }, [airdrops]);

  const loadStats = () => {
    const totalAirdrops = airdrops.length;
    const activeAirdrops = airdrops.filter(a => a.status === 'active').length;
    const totalDistributed = airdrops.reduce((sum, a) => sum + (a.distributed_count || 0), 0);
    
    setStats({
      totalAirdrops,
      activeAirdrops,
      totalDistributed,
      totalUsers: 0 // This would need a separate query
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAirdrop = async () => {
    if (!formData.title || !formData.tokenAmount) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el título y la cantidad de tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAirdrop({
        title: formData.title,
        description: formData.description,
        token_amount: parseFloat(formData.tokenAmount),
        total_recipients: parseInt(formData.totalRecipients) || 0,
        frequency_hours: parseInt(formData.frequencyHours),
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        end_date: formData.endDate ? new Date(formData.endDate).toISOString() : undefined
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        tokenAmount: '',
        totalRecipients: '',
        frequencyHours: '24',
        startDate: '',
        endDate: ''
      });

      setActiveTab('manage');
      
      toast({
        title: "¡Airdrop creado!",
        description: "El airdrop ha sido configurado exitosamente",
      });
    } catch (error) {
      console.error('Error creating airdrop:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el airdrop",
        variant: "destructive",
      });
    }
  };

  const handleDistributeTokens = async (airdropId: string) => {
    try {
      console.log('Starting distribution for airdrop:', airdropId);
      
      // Check if can distribute
      const canDist = await canDistributeAirdrop(airdropId);
      console.log('Can distribute?', canDist);
      
      if (!canDist) {
        toast({
          title: "No se puede distribuir aún",
          description: "El airdrop no está listo para distribución o ya fue distribuido recientemente",
          variant: "destructive"
        });
        return;
      }

      // Confirmation dialog
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas distribuir tokens a todos los usuarios elegibles? Esta acción no se puede deshacer."
      );
      
      if (!confirmed) return;

      // Get all users from profiles with security limit
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(500); // Security limit: max 500 users per batch

      console.log('Profiles fetched:', profiles, 'error:', profilesError);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        toast({
          title: "No hay usuarios",
          description: "No se encontraron usuarios para distribuir tokens",
          variant: "destructive"
        });
        return;
      }

      const recipientIds = profiles.map(p => p.user_id);
      console.log('Distributing to', recipientIds.length, 'users');

      const result = await distributeAirdrop(airdropId, recipientIds);
      console.log('Distribution result:', result);
      
      toast({
        title: "✅ Tokens distribuidos exitosamente",
        description: `Se distribuyeron tokens a ${result.claims_created} usuarios`,
      });
      
      // Refresh data
      await refetch();
    } catch (error) {
      console.error('Error distributing tokens:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al distribuir tokens",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; icon: string; label: string }> = {
      draft: { 
        className: "bg-secondary text-secondary-foreground border-secondary", 
        icon: "📝", 
        label: "Borrador" 
      },
      active: { 
        className: "bg-crypto-green/20 text-crypto-green border-crypto-green/30", 
        icon: "✅", 
        label: "Activo" 
      },
      paused: { 
        className: "bg-destructive/20 text-destructive border-destructive/30", 
        icon: "⏸️", 
        label: "Pausado" 
      },
      completed: { 
        className: "bg-crypto-blue/20 text-crypto-blue border-crypto-blue/30", 
        icon: "🎉", 
        label: "Completado" 
      },
      cancelled: { 
        className: "bg-destructive/20 text-destructive border-destructive/30", 
        icon: "❌", 
        label: "Cancelado" 
      }
    };
    
    const config = statusConfig[status] || { 
      className: "bg-muted text-muted-foreground border-border", 
      icon: "⚪", 
      label: status 
    };
    
    return (
      <Badge className={config.className}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const canDistribute = (airdrop: any) => {
    if (airdrop.status !== 'active') return false;
    if (!airdrop.last_distribution_at) return true;
    
    const lastDistribution = new Date(airdrop.last_distribution_at);
    const nextDistribution = new Date(lastDistribution.getTime() + (airdrop.frequency_hours * 60 * 60 * 1000));
    return new Date() >= nextDistribution;
  };

  const getNextDistributionTime = (airdrop: any) => {
    if (!airdrop.last_distribution_at) return 'Primera distribución pendiente';
    
    const lastDistribution = new Date(airdrop.last_distribution_at);
    const nextDistribution = new Date(lastDistribution.getTime() + (airdrop.frequency_hours * 60 * 60 * 1000));
    
    if (new Date() >= nextDistribution) return 'Disponible ahora';
    
    return `Próxima: ${nextDistribution.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  };

  // Verificar acceso: solo admin y joyero
  const hasAccess = role === 'admin' || role === 'joyero';

  if (!hasAccess) {
    return (
      <AccessDeniedAlert 
        message="Solo administradores y joyerías pueden acceder al sistema de Airdrops."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-heading mb-2">
              Sistema de Airdrops 🪙
            </h1>
            <p className="text-muted-foreground">
              Gestiona la distribución de tokens Veralix a tu comunidad
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-premium transition-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Airdrops</CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAirdrops}</div>
                <p className="text-xs text-muted-foreground">Campañas creadas</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-crypto transition-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Airdrops Activos</CardTitle>
                <PlayCircle className="h-4 w-4 text-crypto-green" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAirdrops}</div>
                <p className="text-xs text-muted-foreground">En ejecución</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-gold transition-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Distribuidos</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDistributed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">VRX tokens</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-premium transition-premium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Participantes</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="create">Crear Airdrop</TabsTrigger>
              <TabsTrigger value="manage">Gestionar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-premium border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Coins className="w-5 h-5 mr-2" />
                      Próxima Distribución
                    </CardTitle>
                    <CardDescription>
                      Airdrops programados para las próximas horas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {airdrops.filter(a => a.status === 'active').length === 0 ? (
                      <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No hay airdrops activos</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {airdrops
                          .filter(a => a.status === 'active')
                          .slice(0, 3)
                          .map((airdrop) => (
                            <div key={airdrop.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                              <div>
                                <h4 className="font-medium">{airdrop.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {airdrop.token_amount} VRX por usuario
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {getNextDistributionTime(airdrop)}
                                </p>
                                 {canDistribute(airdrop) && (
                                   <Badge className="bg-crypto-green/20 text-crypto-green border-crypto-green/30 mt-1">
                                     Listo
                                   </Badge>
                                 )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-premium border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription>
                      Últimas distribuciones realizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Historial de distribuciones próximamente</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Nuevo Airdrop
                  </CardTitle>
                  <CardDescription>
                    Configura una nueva campaña de distribución de tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título del Airdrop *</Label>
                        <Input
                          id="title"
                          placeholder="Ej: Airdrop de Bienvenida Q1 2025"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="tokenAmount">Cantidad de Tokens por Usuario *</Label>
                        <Input
                          id="tokenAmount"
                          type="number"
                          placeholder="100"
                          value={formData.tokenAmount}
                          onChange={(e) => handleInputChange('tokenAmount', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="totalRecipients">Límite de Usuarios (opcional)</Label>
                        <Input
                          id="totalRecipients"
                          type="number"
                          placeholder="1000"
                          value={formData.totalRecipients}
                          onChange={(e) => handleInputChange('totalRecipients', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="frequency">Frecuencia de Distribución</Label>
                        <Select value={formData.frequencyHours} onValueChange={(value) => handleInputChange('frequencyHours', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Cada hora</SelectItem>
                            <SelectItem value="6">Cada 6 horas</SelectItem>
                            <SelectItem value="12">Cada 12 horas</SelectItem>
                            <SelectItem value="24">Diario</SelectItem>
                            <SelectItem value="168">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="startDate">Fecha de Inicio (opcional)</Label>
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="endDate">Fecha de Fin (opcional)</Label>
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el propósito de este airdrop..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleCreateAirdrop}
                    className="w-full bg-gradient-gold hover:shadow-gold transition-premium"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Creando..." : "Crear Airdrop"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <div className="space-y-4">
                {loading ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Cargando airdrops...</p>
                    </CardContent>
                  </Card>
                ) : airdrops.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <CardTitle className="mb-2">No hay airdrops creados</CardTitle>
                      <CardDescription className="mb-4">
                        Crea tu primer airdrop para comenzar a distribuir tokens
                      </CardDescription>
                      <Button onClick={() => setActiveTab('create')} className="bg-gradient-gold hover:shadow-gold">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Airdrop
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  airdrops.map((airdrop) => (
                    <Card key={airdrop.id} className="hover:shadow-premium transition-premium">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                              <Coins className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold font-heading">{airdrop.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {airdrop.token_amount} VRX • Cada {airdrop.frequency_hours}h
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Distribuidos: {airdrop.distributed_count} • {getNextDistributionTime(airdrop)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            {getStatusBadge(airdrop.status)}
                            <div className="flex space-x-2">
                              {airdrop.status === 'active' && canDistribute(airdrop) && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDistributeTokens(airdrop.id)}
                                  className="bg-gradient-crypto hover:shadow-crypto"
                                  disabled={loading}
                                >
                                  <PlayCircle className="w-4 h-4 mr-1" />
                                  Distribuir
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleAirdropStatus(airdrop.id, airdrop.status === 'active' ? 'draft' : 'active')}
                                disabled={loading}
                              >
                                {airdrop.status === 'active' ? (
                                  <>
                                    <PauseCircle className="w-4 h-4 mr-1" />
                                    Pausar
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    Activar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

export default Airdrop;