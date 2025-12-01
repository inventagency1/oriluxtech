import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNFTCertificate } from "@/hooks/useNFTCertificate";
import { mintSingleNFT } from "@/services/crestchain/mint";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Loader2, 
  Sparkles, 
  Terminal, 
  CheckCircle, 
  Package,
  RefreshCw,
  Eye,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  Users,
  Gem
} from "lucide-react";

interface LogEntry {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

interface TestResults {
  jewelry: any;
  certificate: any;
  oriluxData: any;
}

export default function OriluxchainTesting() {
  const [testRunning, setTestRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const { user } = useAuth();
  const { role: userRole, loading: roleLoading, refetchRole } = useUserRole();
  const { generateCertificate } = useNFTCertificate();
  const { toast } = useToast();

  const addLog = (type: LogEntry['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('es-CO', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev, { type, message, timestamp }]);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const createTestJewelry = async () => {
    const testData = {
      name: `Anillo Oriluxchain Test ${Date.now()}`,
      type: 'anillo' as const,
      description: 'Anillo de prueba para testing de integración Oriluxchain',
      materials: ['Oro 18k', 'Diamante'],
      weight: 5.2,
      dimensions: '18mm',
      sale_price: 5000,
      currency: 'USD',
      origin: 'Colombia',
      craftsman: 'Artesano Test',
      status: 'draft' as const,
      user_id: user?.id,
    };

    const { data, error } = await supabase
      .from('jewelry_items')
      .insert([testData])
      .select()
      .single();

    if (error) throw new Error(`Error creando joya: ${error.message}`);
    return data;
  };

  const generateNFTCertificate = async (jewelryId: string) => {
    const result = await generateCertificate(jewelryId);
    if (!result.success) {
      throw new Error(result.error || 'Error generando certificado');
    }
    return result.certificate;
  };

  const checkOriluxchainData = async (certificateUUID: string) => {
    const { data, error } = await supabase
      .from('nft_certificates')
      .select('id, certificate_id, orilux_blockchain_hash, orilux_blockchain_status, orilux_verification_url, orilux_block_number, orilux_tx_hash')
      .eq('id', certificateUUID)
      .single();

    if (error) throw new Error(`Error verificando datos: ${error.message}`);
    return data;
  };

  const runCompleteTest = async () => {
    setLogs([]);
    setTestRunning(true);
    setTestResults(null);

    try {
      // PASO 1: Crear joya de prueba
      addLog('info', '🔨 Creando joya de prueba...');
      const jewelry = await createTestJewelry();
      addLog('success', `✅ Joya creada: ${jewelry.name} (ID: ${jewelry.id})`);

      // PASO 2: Generar certificado NFT
      addLog('info', '📜 Generando certificado NFT...');
      const certificate = await generateNFTCertificate(jewelry.id);
      addLog('success', `✅ Certificado generado: ${certificate.id}`);

      // PASO 3: Esperar registro en Oriluxchain (background)
      addLog('info', '⏳ Esperando registro en Oriluxchain (5 segundos)...');
      await sleep(5000);

      // PASO 4: Verificar datos en DB
      addLog('info', '🔍 Verificando datos de Oriluxchain en DB...');
      const oriluxData = await checkOriluxchainData(certificate.id);
      
      if (oriluxData.orilux_blockchain_hash) {
        addLog('success', `✅ Registrado en Oriluxchain: ${oriluxData.orilux_blockchain_hash}`);
        addLog('success', `📍 Estado: ${oriluxData.orilux_blockchain_status}`);
        addLog('success', `🔗 URL: ${oriluxData.orilux_verification_url || 'N/A'}`);
        addLog('success', `🧱 Bloque: #${oriluxData.orilux_block_number || 'N/A'}`);
      } else {
        addLog('warning', '⚠️ Aún no registrado en Oriluxchain (puede tomar más tiempo)');
      }

      // PASO 5: Guardar resultados
      setTestResults({
        jewelry,
        certificate,
        oriluxData
      });

      addLog('success', '🎉 Test completo finalizado con éxito!');
      
      toast({
        title: "Test completado",
        description: "El flujo de certificación Oriluxchain funcionó correctamente",
      });

    } catch (error: any) {
      addLog('error', `❌ Error: ${error.message}`);
      toast({
        title: "Error en el test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestRunning(false);
    }
  };

  const simulateOriluxchainWebhook = async () => {
    if (!testResults) return;

    addLog('info', '📥 Simulando webhook de Oriluxchain...');

    const webhookPayload = {
      event: 'certificate_verified',
      certificate_id: testResults.certificate.id,
      blockchain: {
        hash: testResults.oriluxData.orilux_blockchain_hash,
        status: 'verified',
        block_number: testResults.oriluxData.orilux_block_number || 1234,
        tx_hash: testResults.oriluxData.orilux_tx_hash || '0xabc123...',
        timestamp: Date.now()
      }
    };

    try {
      const { error } = await supabase.functions.invoke('oriluxchain-webhook', {
        body: webhookPayload
      });

      if (error) {
        addLog('error', `❌ Error en webhook: ${error.message}`);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addLog('success', '✅ Webhook procesado - Certificado verificado');
        
        // Refrescar datos
        await sleep(1000);
        const updatedData = await checkOriluxchainData(testResults.certificate.id);
        setTestResults(prev => prev ? { ...prev, oriluxData: updatedData } : null);
        
        toast({
          title: "Webhook simulado",
          description: "El certificado ahora está verificado",
        });
      }
    } catch (error: any) {
      addLog('error', `❌ Error: ${error.message}`);
    }
  };

  const cleanupTestData = async () => {
    if (!testResults) return;

    const confirmed = window.confirm('¿Eliminar joya y certificado de prueba?');
    if (!confirmed) return;

    addLog('info', '🗑️ Eliminando datos de prueba...');

    try {
      // Eliminar certificado
      await supabase
        .from('nft_certificates')
        .delete()
        .eq('id', testResults.certificate.id);

      // Eliminar joya
      await supabase
        .from('jewelry_items')
        .delete()
        .eq('id', testResults.jewelry.id);

      addLog('success', '✅ Datos de prueba eliminados');
      setTestResults(null);
      
      toast({
        title: "Datos eliminados",
        description: "Los datos de prueba se eliminaron correctamente",
      });
    } catch (error: any) {
      addLog('error', `❌ Error: ${error.message}`);
    }
  };

  const changeRole = async (newRole: 'cliente' | 'joyero' | 'admin') => {
    if (!user) return;
    
    setIsChangingRole(true);
    try {
      const { data, error } = await supabase.rpc('testing_change_role', {
        _user_id: user.id,
        _new_role: newRole
      });

      if (error) throw error;

      toast({ 
        title: "✅ Rol cambiado", 
        description: `Tu rol ha sido actualizado a: ${newRole}`,
        duration: 3000
      });

      // Refetch role and reload page to apply changes
      await refetchRole();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Error cambiando rol:", error);
      toast({ 
        title: "❌ Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Debes iniciar sesión para acceder al testing</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Verificando permisos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-veralix-gold" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Testing de Integración Oriluxchain</h1>
            <p className="text-muted-foreground">
              Prueba completa del flujo de certificación en blockchain
            </p>
          </div>
          <Badge variant="secondary" className="bg-veralix-gold/10 text-veralix-gold border-veralix-gold/30">
            <Shield className="w-3 h-3 mr-1" />
            Rol: {userRole}
          </Badge>
        </div>

        {/* Panel de Gestión de Roles */}
        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Panel de Testing - Gestión de Roles</CardTitle>
            </div>
            <CardDescription>
              Cambia tu rol temporalmente para probar diferentes funcionalidades. 
              <span className="text-amber-600 font-semibold"> ⚠️ Solo para desarrollo.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Rol Actual</p>
                  <p className="text-xs text-muted-foreground">Tu rol en el sistema</p>
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-base px-4 py-1 bg-veralix-gold/10 text-veralix-gold border-veralix-gold/30"
                >
                  {userRole || 'cliente'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={userRole === 'cliente' ? 'default' : 'outline'}
                  onClick={() => changeRole('cliente')}
                  disabled={isChangingRole || userRole === 'cliente'}
                  className="flex flex-col h-auto py-3"
                >
                  <Users className="h-5 w-5 mb-1" />
                  <span className="text-sm">Cliente</span>
                </Button>
                <Button
                  variant={userRole === 'joyero' ? 'default' : 'outline'}
                  onClick={() => changeRole('joyero')}
                  disabled={isChangingRole || userRole === 'joyero'}
                  className="flex flex-col h-auto py-3"
                >
                  <Gem className="h-5 w-5 mb-1" />
                  <span className="text-sm">Joyero</span>
                </Button>
                <Button
                  variant={userRole === 'admin' ? 'default' : 'outline'}
                  onClick={() => changeRole('admin')}
                  disabled={isChangingRole || userRole === 'admin'}
                  className="flex flex-col h-auto py-3"
                >
                  <Shield className="h-5 w-5 mb-1" />
                  <span className="text-sm">Admin</span>
                </Button>
              </div>

              {isChangingRole && (
                <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cambiando rol...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botón Principal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Automatizado Completo</CardTitle>
            <CardDescription>
              Ejecuta todo el flujo: Crear joya → Generar certificado → Registrar en Oriluxchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runCompleteTest}
              disabled={testRunning}
              size="lg"
              className="w-full bg-gradient-to-r from-veralix-gold to-amber-600 hover:from-veralix-gold/90 hover:to-amber-600/90"
            >
              {testRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Ejecutando test...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  🚀 Ejecutar Test Completo de Oriluxchain
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Panel de Logs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Logs en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}
                  >
                    [{log.timestamp}] {log.message}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-muted-foreground text-center mt-20">
                    Esperando ejecución del test...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Panel de Resultados */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resultados del Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  
                  {/* Joya Creada */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold text-sm text-muted-foreground mb-2">
                      Joya Creada
                    </p>
                    <p className="font-mono text-xs">{testResults.jewelry.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {testResults.jewelry.id}</p>
                  </div>

                  {/* Certificado NFT */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold text-sm text-muted-foreground mb-2">
                      Certificado NFT
                    </p>
                    <p className="font-mono text-xs">{testResults.oriluxData.certificate_id}</p>
                    <p className="text-xs text-muted-foreground">UUID: {testResults.certificate.id}</p>
                  </div>

                  {/* Datos de Oriluxchain */}
                  <div className="p-3 bg-gradient-to-br from-veralix-gold/10 to-amber-600/10 border border-veralix-gold/30 rounded-lg">
                    <p className="font-semibold text-sm text-veralix-gold mb-3">
                      🔗 Oriluxchain Blockchain
                    </p>
                    
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge className={`ml-2 ${
                          testResults.oriluxData.orilux_blockchain_status === 'verified' 
                            ? 'bg-green-500' 
                            : 'bg-amber-500'
                        }`}>
                          {testResults.oriluxData.orilux_blockchain_status || 'N/A'}
                        </Badge>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Hash:</span>
                        <p className="font-mono text-[10px] break-all mt-1">
                          {testResults.oriluxData.orilux_blockchain_hash || 'N/A'}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Bloque:</span>
                        <span className="ml-2 font-mono">
                          #{testResults.oriluxData.orilux_block_number || 'N/A'}
                        </span>
                      </div>

                      {testResults.oriluxData.orilux_verification_url && (
                        <a
                          href={testResults.oriluxData.orilux_verification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-veralix-gold hover:underline block mt-2"
                        >
                          🔗 Verificar en Oriluxchain →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={simulateOriluxchainWebhook}
                      variant="outline"
                      className="w-full"
                      disabled={testResults.oriluxData.orilux_blockchain_status === 'verified'}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Simular Webhook de Verificación
                    </Button>

                    <Button
                      onClick={() => window.open(`/certificate/${testResults.oriluxData.certificate_id}`, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Certificado Generado
                    </Button>

                    <Button
                      onClick={cleanupTestData}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Limpiar Datos de Prueba
                    </Button>

                    <Button
                      onClick={async () => {
                        if (!testResults) return;
                        addLog('info', '🪙 Minteando en Crestchain...');
                        try {
                          const res = await mintSingleNFT({ certificateId: testResults.certificate.id, jewelryItemId: testResults.jewelry.id, userId: user!.id });
                          if (!res.success) throw new Error(res.error || 'Error minteando');
                          addLog('success', `✅ Minteado: tx=${res.data?.transactionHash || 'N/A'} tokenId=${res.data?.tokenId || 'N/A'}`);
                        } catch (e) {
                          addLog('error', '❌ Error minteando: ' + (e instanceof Error ? e.message : String(e)));
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Mintear en Crestchain
                    </Button>

                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No hay resultados aún</p>
                  <p className="text-sm mt-2">Ejecuta el test para ver los resultados</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sección de Logs de Edge Function */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs del Edge Function
            </CardTitle>
            <CardDescription>
              Ver logs detallados del Edge Function `generate-nft-certificate`
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.open(
                'https://supabase.com/dashboard/project/hykegpmjnpaupvwptxtl/functions/generate-nft-certificate/logs',
                '_blank'
              )}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Logs en Supabase Dashboard
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
