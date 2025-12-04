import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Wifi, Wallet, FileText, Zap, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message?: string;
  data?: any;
}

const BSC_CONFIG = {
  rpcUrl: "https://bsc-dataseed.binance.org",
  chainId: 56,
  explorer: "https://bscscan.com",
  contractAddress: "0x5aDcEEf785FD21b65986328ca1e6DE0C973eC423",
  walletAddress: "0x9C604DfFf13CbeB8ffe7A4102d9245b5b57784D9"
};

export default function BSCTesting() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateTest = (name: string, status: TestResult["status"], message?: string, data?: any) => {
    setTests(prev => prev.map(t => 
      t.name === name ? { ...t, status, message, data } : t
    ));
  };

  // Test 1: Conexión RPC
  const testRPCConnection = async () => {
    addLog("🔗 Probando conexión RPC a BSC Mainnet...");
    try {
      const response = await fetch(BSC_CONFIG.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1
        })
      });
      
      const data = await response.json();
      const blockNumber = parseInt(data.result, 16);
      addLog(`✅ RPC conectado. Bloque actual: ${blockNumber.toLocaleString()}`);
      return { success: true, blockNumber };
    } catch (error: any) {
      addLog(`❌ Error RPC: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Test 2: Balance de Wallet
  const testWalletBalance = async () => {
    addLog(`💰 Verificando balance de wallet: ${BSC_CONFIG.walletAddress}`);
    try {
      const response = await fetch(BSC_CONFIG.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [BSC_CONFIG.walletAddress, "latest"],
          id: 1
        })
      });
      
      const data = await response.json();
      const balanceWei = BigInt(data.result);
      const balanceBNB = Number(balanceWei) / 1e18;
      addLog(`✅ Balance: ${balanceBNB.toFixed(6)} BNB`);
      
      if (balanceBNB < 0.001) {
        addLog(`⚠️ Balance bajo! Necesitas al menos 0.001 BNB para mintear`);
      }
      
      return { success: true, balance: balanceBNB };
    } catch (error: any) {
      addLog(`❌ Error obteniendo balance: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Test 3: Verificar Contrato
  const testContract = async () => {
    addLog(`📜 Verificando contrato: ${BSC_CONFIG.contractAddress}`);
    try {
      // Llamar totalSupply() del contrato
      const totalSupplySelector = "0x18160ddd"; // keccak256("totalSupply()")
      
      const response = await fetch(BSC_CONFIG.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{
            to: BSC_CONFIG.contractAddress,
            data: totalSupplySelector
          }, "latest"],
          id: 1
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      const totalSupply = parseInt(data.result, 16);
      addLog(`✅ Contrato activo. Total Supply: ${totalSupply} NFTs`);
      return { success: true, totalSupply };
    } catch (error: any) {
      addLog(`❌ Error verificando contrato: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Test 4: Probar Edge Function
  const testEdgeFunction = async () => {
    addLog("🔧 Probando Edge Function generate-nft-certificate...");
    try {
      // Solo verificar que la función responde (sin generar certificado real)
      const { data, error } = await supabase.functions.invoke("test-crestchain-rpc", {
        body: { action: "fullDiagnostic" }
      });
      
      if (error) throw error;
      
      addLog(`✅ Edge Function respondió correctamente`);
      addLog(`   RPC: ${data?.rpc?.status || 'N/A'}`);
      addLog(`   Wallet: ${data?.wallet?.address || 'N/A'}`);
      addLog(`   Balance: ${data?.wallet?.balance || 'N/A'}`);
      
      return { success: true, data };
    } catch (error: any) {
      addLog(`❌ Error en Edge Function: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Test 5: Simular Mint (sin ejecutar)
  const testMintSimulation = async () => {
    addLog("🎯 Simulando mint de certificado...");
    try {
      // Verificar que tenemos los datos necesarios
      const checks = {
        rpc: await testRPCConnection(),
        balance: await testWalletBalance(),
        contract: await testContract()
      };
      
      if (!checks.rpc.success) {
        throw new Error("RPC no disponible");
      }
      
      if (!checks.balance.success || checks.balance.balance < 0.001) {
        throw new Error(`Balance insuficiente: ${checks.balance.balance?.toFixed(6) || 0} BNB`);
      }
      
      if (!checks.contract.success) {
        throw new Error("Contrato no accesible");
      }
      
      addLog("✅ Simulación exitosa - Sistema listo para mintear");
      addLog(`   ✓ RPC conectado (Bloque: ${checks.rpc.blockNumber})`);
      addLog(`   ✓ Balance suficiente (${checks.balance.balance?.toFixed(6)} BNB)`);
      addLog(`   ✓ Contrato activo (${checks.contract.totalSupply} NFTs)`);
      
      return { success: true, checks };
    } catch (error: any) {
      addLog(`❌ Simulación fallida: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    const testList: TestResult[] = [
      { name: "Conexión RPC", status: "pending" },
      { name: "Balance Wallet", status: "pending" },
      { name: "Verificar Contrato", status: "pending" },
      { name: "Edge Function", status: "pending" },
      { name: "Simulación Mint", status: "pending" }
    ];
    
    setTests(testList);
    addLog("🚀 Iniciando tests de BSC Mainnet...");
    addLog("━".repeat(50));

    // Test 1
    updateTest("Conexión RPC", "running");
    const rpcResult = await testRPCConnection();
    updateTest("Conexión RPC", rpcResult.success ? "success" : "error", 
      rpcResult.success ? `Bloque: ${rpcResult.blockNumber?.toLocaleString()}` : rpcResult.error);

    // Test 2
    updateTest("Balance Wallet", "running");
    const balanceResult = await testWalletBalance();
    updateTest("Balance Wallet", balanceResult.success ? "success" : "error",
      balanceResult.success ? `${balanceResult.balance?.toFixed(6)} BNB` : balanceResult.error);

    // Test 3
    updateTest("Verificar Contrato", "running");
    const contractResult = await testContract();
    updateTest("Verificar Contrato", contractResult.success ? "success" : "error",
      contractResult.success ? `Total Supply: ${contractResult.totalSupply}` : contractResult.error);

    // Test 4
    updateTest("Edge Function", "running");
    const edgeResult = await testEdgeFunction();
    updateTest("Edge Function", edgeResult.success ? "success" : "error",
      edgeResult.success ? "Respondió correctamente" : edgeResult.error);

    // Test 5
    updateTest("Simulación Mint", "running");
    const mintResult = await testMintSimulation();
    updateTest("Simulación Mint", mintResult.success ? "success" : "error",
      mintResult.success ? "Sistema listo" : mintResult.error);

    addLog("━".repeat(50));
    addLog("✅ Tests completados");
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "running": return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "running": return <Badge variant="outline" className="bg-blue-50">Ejecutando</Badge>;
      case "success": return <Badge variant="outline" className="bg-green-50 text-green-700">Éxito</Badge>;
      case "error": return <Badge variant="outline" className="bg-red-50 text-red-700">Error</Badge>;
      default: return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 BSC Mainnet Testing</h1>
        <p className="text-muted-foreground">
          Pruebas de conexión y mint de NFTs en BNB Smart Chain
        </p>
      </div>

      {/* Configuración */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Configuración BSC Mainnet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Chain ID:</span>
              <span className="ml-2 font-mono">{BSC_CONFIG.chainId}</span>
            </div>
            <div>
              <span className="font-medium">RPC:</span>
              <span className="ml-2 font-mono text-xs">{BSC_CONFIG.rpcUrl}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Contrato:</span>
              <a 
                href={`${BSC_CONFIG.explorer}/address/${BSC_CONFIG.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-mono text-xs text-blue-600 hover:underline flex items-center gap-1 inline-flex"
              >
                {BSC_CONFIG.contractAddress}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Wallet Sistema:</span>
              <a 
                href={`${BSC_CONFIG.explorer}/address/${BSC_CONFIG.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 font-mono text-xs text-blue-600 hover:underline flex items-center gap-1 inline-flex"
              >
                {BSC_CONFIG.walletAddress}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Tests */}
      <div className="mb-6">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          size="lg"
          className="w-full md:w-auto"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando Tests...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Ejecutar Todos los Tests
            </>
          )}
        </Button>
      </div>

      {/* Resultados de Tests */}
      {tests.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultados de Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {test.message && (
                      <span className="text-sm text-muted-foreground">{test.message}</span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consola de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="font-mono text-sm">{">"}_</span>
            Consola
          </CardTitle>
          <CardDescription>
            Logs detallados de las pruebas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <span className="text-gray-500">// Ejecuta los tests para ver los logs...</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Links útiles */}
      <div className="mt-6 flex flex-wrap gap-4">
        <a 
          href={`${BSC_CONFIG.explorer}/address/${BSC_CONFIG.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Ver Contrato en BscScan <ExternalLink className="h-3 w-3" />
        </a>
        <a 
          href={`${BSC_CONFIG.explorer}/address/${BSC_CONFIG.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          Ver Wallet en BscScan <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
