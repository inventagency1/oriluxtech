import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Crown, UserCheck, Shield, Edit, RefreshCw, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserStatsCards } from "./users/UserStatsCards";
import { EditWhatsAppModal } from "./EditWhatsAppModal";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: 'joyero' | 'cliente' | 'admin';
  created_at: string;
  last_sign_in_at?: string;
  phone?: string;
  country?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          phone,
          country,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersData = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: userRole?.role,
          created_at: profile.created_at,
          last_sign_in_at: null, // This would need auth.users access
          phone: profile.phone,
          country: profile.country
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'joyero' | 'cliente' | 'admin') => {
    try {
      const { data, error } = await supabase.rpc('admin_change_user_role', {
        _target_user_id: userId,
        _new_role: newRole
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to change role');
      }

      toast({
        title: "Rol actualizado",
        description: `Rol cambiado a ${newRole} exitosamente`,
      });

      // Refresh users list
      fetchUsers();
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el rol",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'joyero':
        return <Badge variant="default"><Crown className="w-3 h-3 mr-1" />Joyero</Badge>;
      case 'cliente':
        return <Badge variant="secondary"><UserCheck className="w-3 h-3 mr-1" />Cliente</Badge>;
      default:
        return <Badge variant="outline">Sin rol</Badge>;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || user.role === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestión de Usuarios
          </span>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Administra roles y permisos de usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserStatsCards users={users} />
        
        <div className="flex gap-4 mb-6 mt-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="joyero">Joyero</TabsTrigger>
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">+{user.country || 'N/A'} {user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin configurar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsWhatsAppDialogOpen(true);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            WhatsApp
                          </Button>
                          
                          <Dialog open={isRoleDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setIsRoleDialogOpen(open);
                            if (!open) setSelectedUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Rol
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                                <DialogDescription>
                                  Cambiar el rol de {user.full_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                  <Button 
                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                    variant={user.role === 'admin' ? 'default' : 'outline'}
                                    className="justify-start h-12"
                                  >
                                    <Shield className="w-5 h-5 mr-3" />
                                    <div className="text-left">
                                      <div className="font-semibold">Administrador</div>
                                      <div className="text-sm opacity-70">Control total del sistema</div>
                                    </div>
                                  </Button>
                                  <Button 
                                    onClick={() => handleRoleChange(user.id, 'joyero')}
                                    variant={user.role === 'joyero' ? 'default' : 'outline'}
                                    className="justify-start h-12"
                                  >
                                    <Crown className="w-5 h-5 mr-3" />
                                    <div className="text-left">
                                      <div className="font-semibold">Joyero</div>
                                      <div className="text-sm opacity-70">Crear y certificar joyas</div>
                                    </div>
                                  </Button>
                                  <Button 
                                    onClick={() => handleRoleChange(user.id, 'cliente')}
                                    variant={user.role === 'cliente' ? 'default' : 'outline'}
                                    className="justify-start h-12"
                                  >
                                    <UserCheck className="w-5 h-5 mr-3" />
                                    <div className="text-left">
                                      <div className="font-semibold">Cliente</div>
                                      <div className="text-sm opacity-70">Comprar joyas certificadas</div>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* WhatsApp Edit Modal */}
      {selectedUser && (
        <EditWhatsAppModal
          open={isWhatsAppDialogOpen}
          onOpenChange={setIsWhatsAppDialogOpen}
          userId={selectedUser.id}
          currentPhone={selectedUser.phone}
          currentCountry={selectedUser.country}
          userName={selectedUser.full_name || selectedUser.email}
          onSuccess={fetchUsers}
        />
      )}
    </Card>
  );
}
