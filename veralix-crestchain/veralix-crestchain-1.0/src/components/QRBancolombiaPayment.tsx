import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Upload, 
  Loader2, 
  Copy, 
  Check,
  AlertCircle,
  Smartphone,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Datos de la cuenta Bancolombia
const LLAVE_BREB = "0090925444";
const NOMBRE_CUENTA = "ORILUX TECH SAS";
// URL del QR generado dinámicamente (fallback si no hay imagen local)
const QR_BANCOLOMBIA_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`bancolombia://pay?llave=${LLAVE_BREB}&nombre=${NOMBRE_CUENTA}`)}`;

interface QRBancolombiaPaymentProps {
  monto: number;
  paqueteId: string;
  paqueteNombre: string;
  certificados: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function QRBancolombiaPayment({
  monto,
  paqueteId,
  paqueteNombre,
  certificados,
  onSuccess,
  onCancel
}: QRBancolombiaPaymentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'instructions' | 'upload' | 'success'>('instructions');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referencia, setReferencia] = useState('');
  const [pagoId, setPagoId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generar referencia única
  const generarReferencia = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VRX-${timestamp}-${random}`;
  };

  const handleCopyLlave = async () => {
    await navigator.clipboard.writeText(LLAVE_BREB);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Llave Bre-B copiada al portapapeles",
    });
  };

  const handleIniciarPago = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const nuevaReferencia = generarReferencia();
      
      // Crear registro de pago pendiente
      const { data, error } = await supabase
        .from('pagos_qr')
        .insert({
          user_id: user.id,
          referencia: nuevaReferencia,
          monto: monto,
          estado: 'pendiente',
          detalles: {
            package_id: paqueteId,
            package_name: paqueteNombre,
            certificates_count: certificados
          }
        })
        .select()
        .single();

      if (error) throw error;

      setReferencia(nuevaReferencia);
      setPagoId(data.id);
      setStep('upload');

    } catch (error: any) {
      console.error('Error al iniciar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: "El archivo debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }
      setComprobante(file);
    }
  };

  const handleSubmitComprobante = async () => {
    if (!comprobante || !pagoId || !user) {
      toast({
        title: "Error",
        description: "Debes adjuntar el comprobante de pago",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Subir comprobante a Supabase Storage
      const fileExt = comprobante.name.split('.').pop();
      const fileName = `${pagoId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(`pagos-qr/${fileName}`, comprobante, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Si el bucket no existe, intentar sin storage
        // y guardar solo la referencia
      }

      // Actualizar pago con comprobante
      const { error: updateError } = await supabase
        .from('pagos_qr')
        .update({ 
          comprobante_url: fileName,
          estado: 'en_revision'
        })
        .eq('id', pagoId);

      if (updateError) throw updateError;

      setStep('success');
      toast({
        title: "¡Comprobante enviado!",
        description: "Estamos verificando tu pago. Te notificaremos cuando sea aprobado.",
      });

    } catch (error: any) {
      console.error('Error al subir comprobante:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el comprobante. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 1: Instrucciones
  if (step === 'instructions') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Pagar con QR Bancolombia</CardTitle>
          <CardDescription>
            Paga de forma segura escaneando el código QR desde tu app de Bancolombia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen del pago */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Paquete:</span>
              <span className="font-medium">{paqueteNombre}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Certificados:</span>
              <span className="font-medium">{certificados} unidades</span>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total a pagar:</span>
              <span className="text-2xl font-bold text-primary">
                ${monto.toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>

          {/* Código QR */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border">
              <img 
                src="/qr-bancolombia.png" 
                alt="QR Bancolombia - Orilux Tech SAS" 
                className="w-64 h-64 object-contain"
                onError={(e) => {
                  // Si no carga la imagen, mostrar placeholder
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=bancolombia://pay?llave=${LLAVE_BREB}`;
                }}
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">{NOMBRE_CUENTA}</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-base px-4 py-1">
                  Llave: {LLAVE_BREB}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleCopyLlave}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Instrucciones de pago:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Abre tu app de <strong>Bancolombia</strong> o <strong>Nequi</strong></li>
              <li>Selecciona <strong>"Pagar con QR"</strong> o <strong>"Transferir"</strong></li>
              <li>Escanea el código QR o ingresa la llave <strong>{LLAVE_BREB}</strong></li>
              <li>Ingresa el monto exacto: <strong>${monto.toLocaleString('es-CO')} COP</strong></li>
              <li>Confirma el pago y <strong>guarda el comprobante</strong></li>
            </ol>
          </div>

          {/* Alerta importante */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">Importante:</p>
                <p className="text-amber-700 dark:text-amber-300">
                  Después de realizar el pago, deberás subir el comprobante para que podamos verificarlo 
                  y activar tus certificados. Este proceso puede tomar hasta 24 horas hábiles.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleIniciarPago}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Ya realicé el pago'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Paso 2: Subir comprobante
  if (step === 'upload') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Subir Comprobante de Pago</CardTitle>
          <CardDescription>
            Sube una captura o foto del comprobante de tu transferencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referencia */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Tu referencia de pago:</p>
            <p className="font-mono text-lg font-bold">{referencia}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Guarda esta referencia para cualquier consulta
            </p>
          </div>

          {/* Upload area */}
          <div className="space-y-4">
            <Label htmlFor="comprobante">Comprobante de pago</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Input
                id="comprobante"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="comprobante" className="cursor-pointer">
                {comprobante ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="font-medium">{comprobante.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Click para cambiar archivo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="font-medium">Click para subir comprobante</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG o PDF (máx. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setStep('instructions')}
              className="flex-1"
            >
              Volver
            </Button>
            <Button 
              onClick={handleSubmitComprobante}
              disabled={!comprobante || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Comprobante'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Paso 3: Éxito
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">¡Pago en Proceso!</h2>
          <p className="text-muted-foreground">
            Hemos recibido tu comprobante y estamos verificando el pago.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Referencia:</span>
            <span className="font-mono font-medium">{referencia}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monto:</span>
            <span className="font-medium">${monto.toLocaleString('es-CO')} COP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              En revisión
            </Badge>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm">
          <p>
            Te notificaremos por correo electrónico cuando tu pago sea aprobado 
            y tus certificados estén disponibles. Este proceso puede tomar hasta 
            <strong> 24 horas hábiles</strong>.
          </p>
        </div>

        <Button onClick={onSuccess} className="w-full">
          Ir al Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}
