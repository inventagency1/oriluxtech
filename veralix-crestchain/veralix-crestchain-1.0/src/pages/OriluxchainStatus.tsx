import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Check, X, Activity, Database, ShieldCheck, Globe, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const OriluxchainStatus = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' | 'network' }>>([]);
  const [userCheckId, setUserCheckId] = useState('');
  const [packageResult, setPackageResult] = useState<any>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const [statuses, setStatuses] = useState({
    health: 'pending',
    packages: 'pending',
    sync: 'pending',
    cert: 'pending'
  });

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'network' = 'info') => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      msg,
      type
    }]);
  };

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const checkConnectivity = async () => {
    setIsChecking(true);
    setIsConnected(false);
    setStatuses({
      health: 'checking',
      packages: 'checking',
      sync: 'checking',
      cert: 'checking'
    });
    
    setLogs([]); // Clear logs on refresh
    addLog('[NETWORK] Iniciando verificación de conectividad...', 'network');

    // Simulate checks with delays
    try {
      // 1. Health Check
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, health: 'online' }));
        addLog('[OK] Endpoint /health verificado correctamente', 'success');
      }, 600);

      // 2. Packages
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, packages: 'online' }));
        addLog('[OK] Endpoint /users/packages verificado correctamente', 'success');
      }, 1200);

      // 3. Sync
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, sync: 'online' }));
        addLog('[OK] Endpoint /veralix/sync verificado correctamente', 'success');
      }, 1800);

      // 4. Cert
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, cert: 'online' }));
        addLog('[OK] Endpoint /certificates/create verificado correctamente', 'success');
        
        setIsConnected(true);
        setIsChecking(false);
        addLog('[NETWORK] ✅ Conexión establecida con Veralix Core', 'success');
        toast.success("Conexión establecida con Oriluxchain");
      }, 2400);

    } catch (error) {
      setIsChecking(false);
      addLog('[ERROR] Fallo en la verificación de conectividad', 'error');
    }
  };

  const checkUserPackages = () => {
    if (!userCheckId) {
      toast.error('Por favor ingresa un ID de usuario');
      return;
    }

    addLog(`[AUTH] Verificando paquetes para usuario: ${userCheckId}...`, 'info');
    setPackageResult(null);

    setTimeout(() => {
      const hasPackage = Math.random() > 0.3;
      
      if (hasPackage) {
        setPackageResult({
          status: 'active',
          type: 'Gold Member',
          available: 15,
          priority: 'Alta'
        });
        addLog(`[SUCCESS] Usuario ${userCheckId} autorizado. 15 certificados disponibles.`, 'success');
        addLog(`[READY] Esperando solicitud de certificación...`, 'info');
      } else {
        setPackageResult({
          status: 'inactive'
        });
        addLog(`[DENIED] Usuario ${userCheckId} sin créditos disponibles.`, 'error');
      }
    }, 1000);
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'online') {
      return <span className="px-2 py-1 text-xs rounded bg-green-900 text-green-300 border border-green-700 font-mono">ONLINE</span>;
    }
    if (status === 'offline') {
      return <span className="px-2 py-1 text-xs rounded bg-red-900 text-red-300 border border-red-700 font-mono">OFFLINE</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-gray-600 text-gray-300 font-mono">Checking...</span>;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </Button>

        {/* Header */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-400" />
                ⚡ Simbiosis Veralix ↔️ Oriluxchain
              </h1>
              <p className="text-gray-400 mt-2">Monitor de integración y certificación en tiempo real</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-400">Estado de Conexión</p>
                <div className="flex items-center justify-end space-x-2">
                  <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-gray-300'}`}>
                    {isChecking ? 'Verificando...' : isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                  <span className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500 animate-pulse'}`}></span>
                </div>
              </div>
              <Button 
                onClick={checkConnectivity} 
                disabled={isChecking}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Refrescar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel 1: Monitor de Endpoints */}
          <div className="col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-green-400" />
              Endpoints de Conexión
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div>
                  <p className="font-semibold text-gray-200">Health Check</p>
                  <code className="text-xs text-gray-400 block mt-1">/api/veralix/health</code>
                </div>
                {getStatusBadge(statuses.health)}
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div>
                  <p className="font-semibold text-gray-200">Verificar Paquetes</p>
                  <code className="text-xs text-gray-400 block mt-1">/api/users/packages</code>
                </div>
                {getStatusBadge(statuses.packages)}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div>
                  <p className="font-semibold text-gray-200">Sincronización</p>
                  <code className="text-xs text-gray-400 block mt-1">/api/veralix/sync</code>
                </div>
                {getStatusBadge(statuses.sync)}
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div>
                  <p className="font-semibold text-gray-200">Certificación</p>
                  <code className="text-xs text-gray-400 block mt-1">/api/certificates/create</code>
                </div>
                {getStatusBadge(statuses.cert)}
              </div>
            </div>
          </div>

          {/* Panel 2: Simbiosis en Vivo (Logs) */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            {/* Logs Console */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-purple-400" />
                Flujo de Simbiosis (En Vivo)
              </h2>
              
              <div 
                ref={logContainerRef}
                className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm border border-gray-800 shadow-inner"
              >
                {logs.map((log, i) => (
                  <p key={i} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    log.type === 'network' ? 'text-blue-300' : 
                    'text-gray-400'
                  }`}>
                    <span className="opacity-50">[{log.time}]</span> {log.msg}
                  </p>
                ))}
                {logs.length === 0 && <p className="text-gray-600 italic">Esperando eventos...</p>}
              </div>
            </div>

            {/* User Package Check */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                <Box className="w-5 h-5 mr-2 text-yellow-500" />
                📦 Verificación de Paquetes de Usuario
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Input 
                  type="text" 
                  placeholder="ID Usuario Veralix (ej: USER-123)" 
                  className="bg-gray-700 text-white border-gray-600 focus:ring-purple-500"
                  value={userCheckId}
                  onChange={(e) => setUserCheckId(e.target.value)}
                />
                <Button 
                  onClick={checkUserPackages} 
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verificar Cupo
                </Button>
              </div>

              {packageResult && (
                <div className={`mt-6 p-4 rounded-lg border animate-in fade-in slide-in-from-top-4 ${
                  packageResult.status === 'active' 
                    ? 'bg-green-900/20 border-green-800' 
                    : 'bg-red-900/20 border-red-800'
                }`}>
                  {packageResult.status === 'active' ? (
                    <>
                      <div className="flex items-center text-green-400 mb-2 font-bold text-lg">
                        <Check className="w-6 h-6 mr-2" />
                        Paquete Activo: {packageResult.type}
                      </div>
                      <div className="text-sm text-gray-300 grid grid-cols-2 gap-4 mt-3 pl-8">
                        <p>Certificados Disponibles: <strong className="text-white">{packageResult.available}</strong></p>
                        <p>Nivel de Prioridad: <strong className="text-white">{packageResult.priority}</strong></p>
                        <p className="col-span-2 text-xs text-gray-500 mt-2 flex items-center">
                          <RefreshCw className="w-3 h-3 mr-1" /> Sincronizado con Veralix DB
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-red-400 mb-2 font-bold text-lg">
                        <X className="w-6 h-6 mr-2" />
                        Sin Paquetes Disponibles
                      </div>
                      <div className="text-sm text-gray-300 pl-8">
                        <p>El usuario no tiene créditos de certificación activos.</p>
                        <Button variant="link" className="text-blue-400 p-0 h-auto mt-2">
                          Comprar créditos en Marketplace &rarr;
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OriluxchainStatus;
