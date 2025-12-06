import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Search, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Certificate {
  id: string;
  certificate_id: string;
  property_id: string | null;
  user_id: string;
  owner_id: string;
  created_at: string;
  is_verified: boolean;
  blockchain_network: string;
  transaction_hash: string | null;
  token_id: string | null;
  crestchain_tx_hash?: string | null;
  crestchain_token_id?: string | null;
  crestchain_block_number?: string | null;
  certificate_pdf_url: string | null;
  verification_url: string | null;
  jewelry_name?: string;
  jewelry_type?: string;
  user_email?: string;
  user_name?: string;
  [key: string]: any; // Allow additional properties from DB
}

export default function AllCertificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    today: 0
  });

  const loadCertificates = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los certificados
      const { data: certsData, error: certsError } = await supabase
        .from('nft_certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (certsError) throw certsError;

      // Obtener IDs únicos de joyas y usuarios
      const jewelryIds = [...new Set((certsData || []).map(c => c.property_id).filter(Boolean))];
      const userIds = [...new Set((certsData || []).map(c => c.user_id).filter(Boolean))];

      // Obtener datos de joyas
      let jewelryMap: Record<string, any> = {};
      if (jewelryIds.length > 0) {
        const { data: jewelryData } = await supabase
          .from('jewelry_items')
          .select('id, name, type')
          .in('id', jewelryIds);
        
        jewelryMap = (jewelryData || []).reduce((acc, j) => ({ ...acc, [j.id]: j }), {});
      }

      // Obtener datos de usuarios
      let userMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        
        userMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      // Combinar datos
      const enrichedCerts = (certsData || []).map(cert => ({
        ...cert,
        jewelry_name: jewelryMap[cert.property_id]?.name || 'Sin nombre',
        jewelry_type: jewelryMap[cert.property_id]?.type || 'N/A',
        user_email: userMap[cert.user_id]?.email || 'N/A',
        user_name: userMap[cert.user_id]?.full_name || 'Usuario'
      }));

      setCertificates(enrichedCerts);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      setStats({
        total: enrichedCerts.length,
        verified: enrichedCerts.filter(c => c.is_verified).length,
        pending: enrichedCerts.filter(c => !c.is_verified).length,
        today: enrichedCerts.filter(c => c.created_at.split('T')[0] === today).length
      });

    } catch (error) {
      console.error('Error loading certificates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los certificados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`
    });
  };

  const filteredCertificates = certificates.filter(cert => {
    const search = searchTerm.toLowerCase();
    return (
      cert.certificate_id?.toLowerCase().includes(search) ||
      cert.jewelry_name?.toLowerCase().includes(search) ||
      cert.user_email?.toLowerCase().includes(search) ||
      cert.user_name?.toLowerCase().includes(search) ||
      cert.crestchain_tx_hash?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Todos los Certificados
          </h1>
          <p className="text-muted-foreground mt-1">
            Vista administrativa de todos los certificados generados en el sistema
          </p>
        </div>
        <Button onClick={loadCertificates} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Certificados</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verificados</p>
                <p className="text-3xl font-bold text-green-500">{stats.verified}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoy</p>
                <p className="text-3xl font-bold text-blue-500">{stats.today}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por ID, nombre de joya, email de usuario o hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de certificados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificados ({filteredCertificates.length})</CardTitle>
          <CardDescription>
            Todos los certificados NFT generados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2">Cargando certificados...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificado ID</TableHead>
                    <TableHead>Joya</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Red</TableHead>
                    <TableHead>CrestChain TX</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {cert.certificate_id?.slice(0, 15)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(cert.certificate_id, 'ID')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cert.jewelry_name}</p>
                          <p className="text-xs text-muted-foreground">{cert.jewelry_type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{cert.user_name}</p>
                            <p className="text-xs text-muted-foreground">{cert.user_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cert.is_verified ? (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cert.blockchain_network || 'CrestChain'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cert.crestchain_tx_hash ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {cert.crestchain_tx_hash.slice(0, 10)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://scan.crestchain.pro/tx/${cert.crestchain_tx_hash}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(cert.created_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {cert.certificate_pdf_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const url = cert.certificate_pdf_url;
                                if (url?.startsWith('ipfs://')) {
                                  window.open(`https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`, '_blank');
                                } else if (url) {
                                  window.open(url, '_blank');
                                }
                              }}
                              title="Ver certificado"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          {cert.verification_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(cert.verification_url!, '_blank')}
                              title="Verificar"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredCertificates.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No se encontraron certificados
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
