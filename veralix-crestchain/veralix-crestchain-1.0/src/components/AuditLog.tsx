import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Search, 
  Clock, 
  User, 
  Gem,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Calendar,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: any;
  user_agent: string | null;
  created_at: string;
  user_id: string;
}

export function AuditLog() {
  const { user } = useAuth();
  const { canViewAllAudit } = useRoleValidation();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'security' | 'actions'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LOGS_PER_PAGE = 20;

  useEffect(() => {
    if (user) {
      loadAuditLogs(1);
    }
  }, [user, canViewAllAudit, dateRange]);

  const loadAuditLogs = async (page = 1) => {
    try {
      setLoading(true);
      
      const from = (page - 1) * LOGS_PER_PAGE;
      const to = from + LOGS_PER_PAGE - 1;
      
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!canViewAllAudit) {
        query = query.eq('user_id', user?.id);
      }

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error loading audit logs:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros de auditoría",
          variant: "destructive",
        });
        return;
      }

      setLogs(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Error al cargar los registros de auditoría",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - logDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Justo ahora';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return logDate.toLocaleDateString('es-CO');
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'login': 'Inicio de Sesión',
      'logout': 'Cierre de Sesión',
      'role_change': 'Cambio de Rol',
      'jewelry_create': 'Joya Creada',
      'jewelry_update': 'Joya Actualizada',
      'jewelry_delete': 'Joya Eliminada',
      'certificate_create': 'Certificado Creado',
      'certificate_verify': 'Certificado Verificado',
      'certificate_transfer': 'Transferencia de Certificado',
      'unauthorized_access': 'Acceso No Autorizado',
      'profile_view': 'Perfil Visto',
      'certificates_view': 'Certificados Vistos',
    };
    return labels[action] || action;
  };

  const getSeverityConfig = (action: string) => {
    const critical = ['unauthorized_access', 'jewelry_delete', 'certificate_transfer'];
    const warning = ['role_change', 'logout'];
    
    if (critical.includes(action)) {
      return { 
        variant: 'destructive' as const, 
        icon: AlertTriangle,
        bgClass: 'bg-destructive/10',
        textClass: 'text-destructive'
      };
    }
    if (warning.includes(action)) {
      return { 
        variant: 'secondary' as const, 
        icon: Shield,
        bgClass: 'bg-yellow-500/10',
        textClass: 'text-yellow-600'
      };
    }
    return { 
      variant: 'outline' as const, 
      icon: CheckCircle,
      bgClass: 'bg-primary/5',
      textClass: 'text-primary'
    };
  };

  const getActionBadge = (action: string) => {
    const config = getSeverityConfig(action);
    return <Badge variant={config.variant}>{getActionLabel(action)}</Badge>;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <User className="w-4 h-4" />;
      case 'jewelry_create':
      case 'jewelry_update':
      case 'jewelry_delete':
        return <Gem className="w-4 h-4" />;
      case 'certificate_create':
      case 'certificate_verify':
        return <Shield className="w-4 h-4" />;
      case 'unauthorized_access':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Acción', 'Recurso', 'ID', 'Usuario', 'Detalles'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString('es-CO'),
      getActionLabel(log.action),
      log.resource_type,
      log.resource_id || '',
      log.details?.user_email || '',
      JSON.stringify(log.details || {})
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria-${new Date().toISOString()}.csv`;
    link.click();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.resource_id && log.resource_id.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filter === 'security') {
        const securityActions = ['login', 'logout', 'role_change', 'unauthorized_access'];
        return matchesSearch && securityActions.includes(log.action);
      }
      if (filter === 'actions') {
        const actionTypes = ['jewelry_create', 'jewelry_update', 'certificate_create', 'certificate_verify'];
        return matchesSearch && actionTypes.includes(log.action);
      }
      return matchesSearch;
    });
  }, [logs, searchTerm, filter]);

  const groupLogsByDate = (logs: AuditLogEntry[]) => {
    const groups: Record<string, AuditLogEntry[]> = {};
    
    logs.forEach(log => {
      const date = new Date(log.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let label: string;
      if (date.toDateString() === today.toDateString()) {
        label = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = 'Ayer';
      } else {
        label = date.toLocaleDateString('es-CO', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(log);
    });
    
    return groups;
  };

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs), [filteredLogs]);

  const statsToday = logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
  const statsSecurity = logs.filter(l => ['login', 'logout', 'unauthorized_access'].includes(l.action)).length;
  const statsCritical = logs.filter(l => ['unauthorized_access', 'certificate_transfer'].includes(l.action)).length;

  const totalPages = Math.ceil(totalCount / LOGS_PER_PAGE);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold">{totalCount}</p>
              </div>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-veralix-gold opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Hoy</p>
                <p className="text-xl sm:text-2xl font-bold">{statsToday}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Seguridad</p>
                <p className="text-xl sm:text-2xl font-bold">{statsSecurity}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Críticos</p>
                <p className="text-xl sm:text-2xl font-bold">{statsCritical}</p>
              </div>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading flex items-center gap-2">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-veralix-gold" />
            <span className="hidden sm:inline">Registro de Auditoría</span>
            <span className="sm:hidden">Auditoría</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {canViewAllAudit 
              ? <span className="hidden sm:inline">Monitoreo de todas las actividades del sistema</span>
              : 'Historial de tus actividades'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => loadAuditLogs(currentPage)} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DateRangePicker
          value={dateRange || undefined}
          onChange={(range) => setDateRange(range)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">Seguridad</TabsTrigger>
          <TabsTrigger value="actions" className="text-xs sm:text-sm">Acciones</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-6 mt-4">
          {loading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Cargando registros...</p>
              </CardContent>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {searchTerm ? 'No se encontraron registros' : 'No hay actividad registrada'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    {searchTerm 
                      ? 'Intenta ajustar tus filtros de búsqueda o fecha para ver más resultados.'
                      : 'Cuando realices acciones en la plataforma, aparecerán aquí para tu revisión.'
                    }
                  </p>
                </div>
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Limpiar búsqueda
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {Object.entries(groupedLogs).map(([date, logsInDate]) => (
                <div key={date} className="space-y-3">
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border">
                    <h3 className="text-sm font-semibold text-veralix-gold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {date}
                      <Badge variant="secondary" className="ml-2">{logsInDate.length}</Badge>
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {logsInDate.map((log) => {
                      const severity = getSeverityConfig(log.action);
                      return (
                        <Card 
                          key={log.id} 
                          className="hover:shadow-premium transition-premium cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            {/* Mobile: Stack vertical */}
                            <div className="flex flex-col gap-3 sm:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 ${severity.bgClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <severity.icon className={`w-4 h-4 ${severity.textClass}`} />
                                  </div>
                                  {getActionBadge(log.action)}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatRelativeTime(log.created_at)}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {log.resource_type}
                                  </Badge>
                                  {log.resource_id && (
                                    <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                                      ID: {log.resource_id.slice(0, 8)}...
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {log.details?.message || `Acción ${getActionLabel(log.action)} en ${log.resource_type}`}
                                </p>
                              </div>
                            </div>
                            
                            {/* Desktop: Horizontal layout */}
                            <div className="hidden sm:flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 ${severity.bgClass} rounded-lg flex items-center justify-center mt-1`}>
                                  <severity.icon className={`w-4 h-4 ${severity.textClass}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    {getActionBadge(log.action)}
                                    <Badge variant="outline" className="text-xs">
                                      {log.resource_type}
                                    </Badge>
                                    {log.resource_id && (
                                      <Badge variant="outline" className="text-xs">
                                        ID: {log.resource_id}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {log.details?.message || `Acción ${getActionLabel(log.action)} en ${log.resource_type}`}
                                  </p>
                                  {log.details?.user_email && canViewAllAudit && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Usuario: {log.details.user_email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatRelativeTime(log.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * LOGS_PER_PAGE) + 1} - {Math.min(currentPage * LOGS_PER_PAGE, totalCount)} de {totalCount}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAuditLogs(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => loadAuditLogs(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAuditLogs(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-veralix-gold" />
              Detalles del Registro
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Acción</Label>
                  <p className="font-medium">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha y Hora</Label>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Recurso</Label>
                  <p className="font-medium">{selectedLog.resource_type}</p>
                </div>
                {selectedLog.resource_id && (
                  <div>
                    <Label className="text-xs text-muted-foreground">ID de Recurso</Label>
                    <p className="font-mono text-sm break-all">{selectedLog.resource_id}</p>
                  </div>
                )}
              </div>
              
              {selectedLog.details && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Detalles</Label>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.user_agent && (
                <div>
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <p className="text-xs text-muted-foreground break-all">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}