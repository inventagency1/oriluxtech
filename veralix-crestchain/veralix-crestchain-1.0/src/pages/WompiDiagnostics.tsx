import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const WompiDiagnostics = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔬 Ejecutando diagnóstico de Wompi...');
      
      const { data, error } = await supabase.functions.invoke('wompi-diagnostics');
      
      if (error) {
        console.error('❌ Error en diagnóstico:', error);
        toast.error('Error ejecutando diagnóstico: ' + error.message);
        return;
      }

      console.log('✅ Diagnóstico completado:', data);
      setResults(data);
      
      if (data.analysis?.recommendations?.length > 0) {
        toast.warning('Se encontraron problemas. Revisa los resultados.');
      } else {
        toast.success('Diagnóstico completado sin errores críticos');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error ejecutando diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔬 Diagnóstico Profundo de Wompi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando diagnóstico...
              </>
            ) : (
              "🚀 Ejecutar Diagnóstico Completo"
            )}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              {/* Environment Info */}
              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-lg">🔑 Configuración de Ambiente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clave Pública:</span>
                      <span className="font-mono">{results.diagnostics?.environment?.publicKeyValue || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Clave Privada Configurada:</span>
                      {getStatusIcon(results.diagnostics?.environment?.privateKeyConfigured)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results */}
              <Card className="border-muted">
                <CardHeader>
                  <CardTitle className="text-lg">🧪 Resultados de Pruebas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Acceptance Token Test */}
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">1. Acceptance Token</span>
                      {getStatusIcon(results.diagnostics?.tests?.acceptanceToken?.success)}
                    </div>
                    {results.diagnostics?.tests?.acceptanceToken?.data && (
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(results.diagnostics.tests.acceptanceToken.data, null, 2)}
                      </pre>
                    )}
                    {results.diagnostics?.tests?.acceptanceToken?.error && (
                      <p className="text-sm text-destructive mt-1">
                        Error: {results.diagnostics.tests.acceptanceToken.error}
                      </p>
                    )}
                  </div>

                  {/* Create Transaction Test */}
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">2. Crear Transacción</span>
                      {getStatusIcon(results.diagnostics?.tests?.createTransaction?.success)}
                    </div>
                    {results.diagnostics?.tests?.createTransaction?.data && (
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(results.diagnostics.tests.createTransaction.data, null, 2)}
                      </pre>
                    )}
                    {results.diagnostics?.tests?.createTransaction?.error && (
                      <p className="text-sm text-destructive mt-1">
                        Error: {results.diagnostics.tests.createTransaction.error}
                      </p>
                    )}
                  </div>

                  {/* Merchant Info Test */}
                  {results.diagnostics?.tests?.merchantInfo && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">3. Información del Merchant</span>
                        {getStatusIcon(results.diagnostics.tests.merchantInfo.success)}
                      </div>
                      {results.diagnostics.tests.merchantInfo.data && (
                        <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(results.diagnostics.tests.merchantInfo.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis & Recommendations */}
              <Card className={results.analysis?.recommendations?.length > 0 ? "border-destructive" : "border-success"}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {results.analysis?.recommendations?.length > 0 ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Problemas Detectados
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-success" />
                        Todo en Orden
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.analysis?.publicKeyValid)}
                        <span className="text-sm">Clave Pública Válida</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.analysis?.canCreateTransactions)}
                        <span className="text-sm">Puede Crear Transacciones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.analysis?.merchantActive)}
                        <span className="text-sm">Merchant Activo</span>
                      </div>
                    </div>

                    {results.analysis?.recommendations?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Recomendaciones:</h4>
                        <ul className="space-y-1">
                          {results.analysis.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">📋 Checklist Manual de Wompi:</h4>
            <ul className="space-y-1 text-sm">
              <li>✅ Dominios permitidos: *.lovableproject.com, veralix.io, *.supabase.co</li>
              <li>✅ Modo: Producción (verificar arriba a la derecha en Wompi)</li>
              <li>✅ Verificación de cuenta completada</li>
              <li>✅ Límites de transacción configurados (mín/máx)</li>
              <li>✅ URL de eventos configurada: https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/wompi-payments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WompiDiagnostics;
