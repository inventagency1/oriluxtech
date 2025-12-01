import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface WompiWidgetConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  customerEmail: string;
  customerFullName?: string;
  customerPhoneNumber?: string;
}

interface WompiValidation {
  isValid: boolean;
  isTestMode: boolean;
  keyPrefix: string;
  errors: string[];
}

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}

export const useWompiWidget = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string | null>(null);

  const validateWompiKey = (publicKey: string): WompiValidation => {
    const errors: string[] = [];
    let isValid = true;
    let isTestMode = false;
    let keyPrefix = '';

    // Verificar formato básico
    if (!publicKey || publicKey === 'pub_test_REPLACE_WITH_YOUR_TEST_KEY') {
      errors.push('La clave de Wompi no está configurada');
      isValid = false;
    } else if (!publicKey.startsWith('pub_')) {
      errors.push('La clave debe comenzar con "pub_"');
      isValid = false;
    } else {
      // Detectar modo
      if (publicKey.startsWith('pub_test_')) {
        isTestMode = true;
        keyPrefix = 'pub_test_';
      } else if (publicKey.startsWith('pub_prod_')) {
        isTestMode = false;
        keyPrefix = 'pub_prod_';
      } else {
        errors.push('Formato de clave no reconocido');
        isValid = false;
      }
    }

    console.log('🔐 Validación de clave Wompi:', {
      isValid,
      isTestMode,
      keyPrefix,
      keyPreview: publicKey.substring(0, 20) + '...',
      errors
    });

    return { isValid, isTestMode, keyPrefix, errors };
  };

  const forceReload = () => {
    console.log('🔄 Forzando recarga de página...');
    window.location.reload();
  };

  const waitForWidget = (maxAttempts = 60, interval = 500): Promise<boolean> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const checkWidget = () => {
        attempts++;
        if (window.WidgetCheckout) {
          console.log('✅ Wompi Widget loaded after', attempts, 'attempts');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          console.error('❌ Wompi Widget failed to load after', maxAttempts, 'attempts');
          resolve(false);
        } else {
          setTimeout(checkWidget, interval);
        }
      };
      checkWidget();
    });
  };

  const openCheckout = async (config: WompiWidgetConfig) => {
    try {
      setLastError(null);

      // ✅ PASO 1: Validar configuración de clave
      const validation = validateWompiKey(config.publicKey);
      
      if (!validation.isValid) {
        const errorMsg = `Configuración inválida: ${validation.errors.join(', ')}`;
        console.error('❌ ', errorMsg);
        setLastError(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Clave validada correctamente:', {
        modo: validation.isTestMode ? 'PRUEBA' : 'PRODUCCIÓN',
        prefijo: validation.keyPrefix
      });

      // ⚠️ ADVERTENCIA: Si estamos usando producción sin estar listos
      if (!validation.isTestMode) {
        console.warn('⚠️ USANDO CLAVE DE PRODUCCIÓN - Asegúrate de que tu cuenta Wompi esté activa');
      }

      // ✅ PASO 2: Verificar carga del script
      console.log('🔍 Verificando disponibilidad del Widget Wompi...');
      console.log('window.WidgetCheckout exists?', !!window.WidgetCheckout);
      console.log('WidgetCheckout type:', typeof window.WidgetCheckout);
      
      if (!window.WidgetCheckout) {
        console.warn('⏳ Widget not loaded yet, waiting...');
        const loaded = await waitForWidget();
        
        if (!loaded) {
          const errorMsg = 'El Widget de Wompi no se cargó. Verifica tu conexión o que https://checkout.wompi.co/widget.js no esté bloqueado.';
          console.error('❌ Widget script not loaded!');
          setLastError(errorMsg);
          throw new Error(errorMsg);
        }
      }

      // ✅ PASO 3: Validar datos de pago
      console.log('🚀 Configuración del Widget Wompi:', {
        modo: validation.isTestMode ? '🧪 PRUEBA' : '🏭 PRODUCCIÓN',
        currency: config.currency,
        amountInCents: config.amountInCents,
        amountInCOP: config.amountInCents / 100,
        reference: config.reference,
        publicKey: config.publicKey.substring(0, 20) + '...',
        redirectUrl: config.redirectUrl,
        customerEmail: config.customerEmail,
        customerFullName: config.customerFullName
      });

      if (config.amountInCents < 100) {
        const errorMsg = 'El monto debe ser al menos $1 COP';
        console.error('❌ Monto inválido:', config.amountInCents);
        setLastError(errorMsg);
        throw new Error(errorMsg);
      }

      if (!config.customerEmail) {
        const errorMsg = 'Se requiere un email para procesar el pago';
        console.error('❌ Email faltante');
        setLastError(errorMsg);
        throw new Error(errorMsg);
      }

      // ✅ PASO 4: Crear configuración del Widget
      const widgetConfig: any = {
        currency: config.currency,
        amountInCents: config.amountInCents,
        reference: config.reference,
        publicKey: config.publicKey,
        redirectUrl: config.redirectUrl,
        'customer-data:email': config.customerEmail,
      };

      // Agregar nombre completo si está disponible
      if (config.customerFullName) {
        widgetConfig['customer-data:full-name'] = config.customerFullName;
      }

      // Agregar teléfono si está disponible
      if (config.customerPhoneNumber) {
        widgetConfig['customer-data:phone-number'] = config.customerPhoneNumber;
      }

      console.log('📋 Configuración final del Widget:', widgetConfig);

      // ✅ PASO 5: Crear instancia del widget
      let checkout;
      try {
        checkout = new window.WidgetCheckout(widgetConfig);
        console.log('✅ Instancia del Widget creada exitosamente');
        console.log('📦 Widget object:', checkout);
        console.log('🔧 Widget methods:', Object.keys(checkout || {}));
      } catch (error) {
        const errorMsg = 'Error al crear instancia del Widget. Puede que la clave sea inválida o el servicio no esté disponible.';
        console.error('❌ Error creando Widget:', error);
        setLastError(errorMsg);
        
        // Si la clave parece ser de producción y falla, sugerir recarga
        if (!validation.isTestMode) {
          toast({
            title: "⚠️ Error con clave de producción",
            description: "La clave de producción puede no estar activa. Cambia a modo prueba o recarga la página.",
            variant: "destructive",
            duration: 10000,
          });
        }
        throw new Error(errorMsg);
      }

      // ✅ PASO 6: Abrir el widget
      try {
        checkout.open((result: any) => {
          const timestamp = new Date().toISOString();
          console.log(`📨 [${timestamp}] Callback del Widget ejecutado`);
          console.log('📨 Resultado completo:', result);
          console.log('📨 Propiedades:', Object.keys(result || {}));
          
          if (result?.error) {
            const errorDetails = {
              message: result.error.message,
              code: result.error.code,
              type: result.error.type,
              timestamp
            };
            console.error('❌ Error del Widget:', errorDetails);
            setLastError(result.error.message);
            
            toast({
              title: "❌ Error en el pago",
              description: result.error.message || "Ocurrió un error al procesar el pago. Intenta nuevamente.",
              variant: "destructive",
              duration: 8000,
            });
            return;
          }
          
          const transaction = result?.transaction;
          if (transaction) {
            console.log('✅ Transacción creada:', {
              id: transaction.id,
              status: transaction.status,
              amount: transaction.amount_in_cents,
              timestamp
            });
          } else {
            console.warn('⚠️ No hay objeto de transacción en el resultado');
          }
        });

        console.log('✅ Widget.open() ejecutado correctamente');
        
        // Verificar apertura del Widget después de 2 segundos
        setTimeout(() => {
          const widgetContainer = document.querySelector('[class*="wompi"]');
          const widgetIframe = document.querySelector('iframe[src*="wompi"]');
          
          const domCheck = {
            containerFound: !!widgetContainer,
            iframeFound: !!widgetIframe,
            widgetContainer: widgetContainer ? widgetContainer.className : 'No encontrado',
            iframeUrl: widgetIframe ? (widgetIframe as HTMLIFrameElement).src : 'No encontrado',
            timestamp: new Date().toISOString()
          };
          
          console.log('🔍 Verificación DOM del Widget:', domCheck);
          
          if (!widgetIframe) {
            console.warn('⚠️ El iframe del Widget no se detectó. Posibles causas:');
            console.warn('  1. Error de red al cargar el widget');
            console.warn('  2. Clave de API inválida o cuenta inactiva');
            console.warn('  3. Bloqueador de contenido/anuncios activo');
            setLastError('El widget no se abrió correctamente');
          }
        }, 2000);
        
      } catch (openError) {
        const errorMsg = 'Error al abrir el widget de pago';
        console.error('❌ Error en widget.open():', openError);
        setLastError(errorMsg);
        throw openError;
      }

    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`❌ [${timestamp}] Error general al abrir Widget:`, error);
      console.error('Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Mensaje:', error instanceof Error ? error.message : String(error));
      console.error('Stack:', error instanceof Error ? error.stack : 'No disponible');
      
      const errorMessage = error instanceof Error ? error.message : "No se pudo abrir la pasarela de pago. Intenta recargar la página.";
      setLastError(errorMessage);
      
      toast({
        title: "❌ Error al abrir el checkout",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    }
  };

  return { 
    openCheckout, 
    lastError,
    validateWompiKey,
    forceReload
  };
};
