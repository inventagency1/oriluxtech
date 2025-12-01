import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Coins, Plus, Play, Pause, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Airdrop {
  id: string;
  title: string;
  description?: string;
  token_amount: number;
  status: string;
  total_recipients: number;
  distributed_count: number;
  start_date?: string;
  end_date?: string;
  frequency_hours?: number;
  last_distribution_at?: string;
  created_at: string;
}

export function AirdropManagement() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    token_amount: '',
    total_recipients: '100',
    frequency_hours: '24',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchAirdrops();
  }, []);

  const fetchAirdrops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('airdrops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAirdrops(data || []);
    } catch (error) {
      console.error('Error fetching airdrops:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los airdrops",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const airdropData = {
          title: formData.title,
          description: formData.description,
          token_amount: parseFloat(formData.token_amount),
          total_recipients: parseInt(formData.total_recipients),
          frequency_hours: parseInt(formData.frequency_hours),
          start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
          end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
          status: 'draft',
          created_by: user?.id
        };

      const { error } = await supabase
        .from('airdrops')
        .insert([airdropData]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Airdrop creado exitosamente",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAirdrops();
    } catch (error: any) {
      console.error('Error creating airdrop:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el airdrop",
        variant: "destructive",
      });
    }
  };

  const updateAirdropStatus = async (id: string, status: 'active' | 'paused' | 'completed') => {
    try {
      const { error } = await supabase
        .from('airdrops')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: `Airdrop ${status === 'active' ? 'activado' : status === 'paused' ? 'pausado' : 'completado'}`,
      });

      fetchAirdrops();
    } catch (error: any) {
      console.error('Error updating airdrop:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del airdrop",
        variant: "destructive",
      });
    }
  };

  const distributeAirdrop = async (airdrop: Airdrop) => {
    try {
      // Get all eligible users (you can modify this logic based on your criteria)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(airdrop.total_recipients);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron usuarios elegibles",
          variant: "destructive",
        });
        return;
      }

      const userIds = users.map(u => u.user_id);

      // Call the distribute function
      const { data, error } = await supabase.rpc('distribute_airdrop_tokens', {
        _airdrop_id: airdrop.id,
        _recipient_user_ids: userIds
      });

      if (error) throw error;

      const result = data as { success: boolean; claims_created: number; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Distribution failed');
      }

      toast({
        title: "¡Airdrop Distribuido!",
        description: `Se distribuyeron tokens a ${result.claims_created} usuarios exitosamente`,
      });

      fetchAirdrops();
    } catch (error: any) {
      console.error('Error distributing airdrop:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo distribuir el airdrop",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      token_amount: '',
      total_recipients: '100',
      frequency_hours: '24',
      start_date: '',
      end_date: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      paused: 'outline',
      completed: 'destructive'
    } as const;
    
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      paused: 'Pausado',
      completed: 'Completado'
    };
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {labels[status as keyof typeof labels] || status}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5" />
                <span>Gestión de Airdrops</span>
              </CardTitle>
              <CardDescription>
                Crea y administra airdrops de tokens para los usuarios
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-gold hover:shadow-gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Airdrop
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Airdrop</DialogTitle>
                  <DialogDescription>
                    Configura un nuevo airdrop de tokens para los usuarios
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Airdrop</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ej: Airdrop de Bienvenida"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe el airdrop..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token_amount">Tokens por Usuario</Label>
                      <Input
                        id="token_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.token_amount}
                        onChange={(e) => setFormData({...formData, token_amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_recipients">Total Destinatarios</Label>
                      <Input
                        id="total_recipients"
                        type="number"
                        min="1"
                        value={formData.total_recipients}
                        onChange={(e) => setFormData({...formData, total_recipients: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency_hours">Frecuencia (horas)</Label>
                    <Input
                      id="frequency_hours"
                      type="number"
                      min="1"
                      value={formData.frequency_hours}
                      onChange={(e) => setFormData({...formData, frequency_hours: e.target.value})}
                      placeholder="24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Fecha de Inicio</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Fecha de Fin</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Crear Airdrop
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Cargando airdrops...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airdrops.map((airdrop) => (
                    <TableRow key={airdrop.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{airdrop.title}</p>
                          {airdrop.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {airdrop.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-semibold text-amber-600">{airdrop.token_amount}</p>
                          <p className="text-xs text-muted-foreground">por usuario</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {airdrop.distributed_count} / {airdrop.total_recipients}
                            </span>
                          </div>
                          <div className="w-full bg-muted h-2 rounded-full">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(airdrop.distributed_count / airdrop.total_recipients) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(airdrop.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(airdrop.created_at).toLocaleDateString('es-ES')}</p>
                          {airdrop.last_distribution_at && (
                            <p className="text-muted-foreground">
                              Último: {new Date(airdrop.last_distribution_at).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {airdrop.status === 'draft' || airdrop.status === 'paused' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateAirdropStatus(airdrop.id, 'active')}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Activar
                            </Button>
                          ) : airdrop.status === 'active' ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateAirdropStatus(airdrop.id, 'paused')}
                              >
                                <Pause className="w-4 h-4 mr-1" />
                                Pausar
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => distributeAirdrop(airdrop)}
                                className="bg-gradient-gold hover:shadow-gold"
                              >
                                <Coins className="w-4 h-4 mr-1" />
                                Distribuir
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {airdrops.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay airdrops configurados</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}