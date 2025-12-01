import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, AlertTriangle, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  className?: string;
}

export function QRScanner({ onScan, onClose, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const initializeScanner = useCallback(async () => {
    try {
      // Get available video devices
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      // Configure the reader with improved hints
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.CHARACTER_SET, 'UTF-8');
      
      const reader = new BrowserMultiFormatReader(hints);
      setCodeReader(reader);
      
      return reader;
    } catch (err: any) {
      console.error('Failed to initialize scanner:', err);
      setError('No se pudo inicializar el escáner. Verifica los permisos de cámara.');
      return null;
    }
  }, []);

  const startScanning = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      setIsScanning(true);
      
      if (!videoRef.current) return;

      let reader = codeReader;
      if (!reader) {
        reader = await initializeScanner();
        if (!reader) return;
      }

      // Use specific device or default
      const selectedDeviceId = deviceId || (devices[currentDeviceIndex]?.deviceId);

      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            console.log('QR Code detected:', result.getText());
            onScan(result.getText());
            stopScanning();
            return;
          }
          
          // Only log non-NotFoundException errors
          if (error && error.name !== 'NotFoundException') {
            console.warn('QR scanning error:', error.name, error.message);
          }
        }
      );
    } catch (err: any) {
      console.error('Failed to start camera:', err);
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró una cámara disponible.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      }
      
      setError(errorMessage);
      setIsScanning(false);
    }
  }, [codeReader, devices, currentDeviceIndex, onScan, initializeScanner]);

  const stopScanning = useCallback(() => {
    if (codeReader) {
      codeReader.reset();
      setIsScanning(false);
    }
  }, [codeReader]);

  const retryScanning = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    startScanning();
  }, [startScanning]);

  const switchCamera = useCallback(() => {
    if (devices.length > 1) {
      stopScanning();
      const nextIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextIndex);
      setTimeout(() => startScanning(devices[nextIndex]?.deviceId), 500);
    }
  }, [devices, currentDeviceIndex, stopScanning, startScanning]);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      const reader = await initializeScanner();
      if (mounted && reader) {
        await startScanning();
      }
    };
    
    init();

    return () => {
      mounted = false;
      stopScanning();
    };
  }, [initializeScanner, startScanning, stopScanning]);

  useEffect(() => {
    // Auto-retry on NotFoundException after a delay
    if (retryCount < 3 && isScanning && !error) {
      const retryTimer = setTimeout(() => {
        console.log(`Auto-retry attempt ${retryCount + 1}`);
        retryScanning();
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [retryCount, isScanning, error, retryScanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-heading flex items-center">
          <Camera className="w-5 h-5 mr-2 text-primary" />
          Escanear Código QR
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg border-dashed animate-pulse" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary">
                    {isScanning ? 'Escaneando...' : 'Preparando cámara...'}
                  </Badge>
                  {retryCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Intento {retryCount + 1}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Apunta la cámara hacia el código QR del certificado
                </p>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryScanning}
                    disabled={!isScanning}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reintentar
                  </Button>
                  
                  {devices.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={switchCamera}
                    >
                      <Camera className="w-4 h-4 mr-1" />
                      Cambiar Cámara
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}