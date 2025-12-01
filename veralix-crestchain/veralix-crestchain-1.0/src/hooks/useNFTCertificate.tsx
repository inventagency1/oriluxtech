import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CertificateGenerationResult {
  success: boolean;
  certificate?: {
    id: string;
    transactionHash: string;
    tokenId: string;
    metadataUri: string;
    certificateViewUrl: string;
    blockchainVerificationUrl: string;
    verificationUrl: string;
    qrCodeUrl: string;
    pdfUrl: string;
  };
  error?: string;
  message: string;
}

export function useNFTCertificate() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Función auxiliar para generar certificado con reintentos automáticos
  const generateCertificateWithRetry = async (
    jewelryItemId: string,
    userId: string,
    maxRetries = 3,
    certificatePassword?: string
  ): Promise<CertificateGenerationResult> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Intento ${attempt}/${maxRetries} de generar certificado`);

        const response = await supabase.functions.invoke('generate-nft-certificate', {
          body: {
            jewelryItemId,
            userId,
            certificatePassword: certificatePassword || null
          }
        });

        if (response.error) {
          throw new Error(response.error.message || 'Error generating certificate');
        }

        const result = response.data as CertificateGenerationResult;

        if (!result.success) {
          throw new Error(result.error || 'Certificate generation failed');
        }

        // ✅ Éxito
        console.log(`✅ Certificado generado exitosamente en intento ${attempt}`);
        return result;

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, error.message);

        // Si no es el último intento, esperar antes de reintentar (backoff exponencial)
        if (attempt < maxRetries) {
          const waitTime = attempt * 3000; // 3s, 6s, 9s

          toast({
            title: `Reintentando... (${attempt}/${maxRetries})`,
            description: `Esperando ${waitTime / 1000}s antes del próximo intento`,
            variant: "default",
          });

          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError || new Error('Falló después de múltiples intentos');
  };

  const generateCertificate = async (jewelryItemId: string, certificatePassword?: string): Promise<CertificateGenerationResult> => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verificar balance de certificados desde paquetes comprados
      const { data: purchases, error: purchaseError } = await supabase
        .from('certificate_purchases')
        .select('certificates_remaining')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .gt('certificates_remaining', 0)
        .order('purchased_at', { ascending: true })
        .limit(1);

      if (purchaseError) {
        console.error('Error checking certificate balance:', purchaseError);
        throw new Error('Error al verificar el balance de certificados');
      }

      if (!purchases || purchases.length === 0) {
        throw new Error(
          'No tienes certificados disponibles. Por favor, compra un paquete de certificados desde la página de Precios.'
        );
      }

      console.log('Certificate balance verified:', {
        availableCertificates: purchases[0].certificates_remaining,
        packageFound: true
      });

      console.log('Generating NFT certificate for jewelry:', jewelryItemId, { hasPassword: !!certificatePassword });
      
      // Usar función con reintentos automáticos (3 intentos máximo)
      const result = await generateCertificateWithRetry(jewelryItemId, user.id, 3, certificatePassword);

      toast({
        title: "¡Certificado NFT generado!",
        description: "Certificado registrado en Dual-Blockchain (Oriluxchain + CrestChain)",
      });

      // Get user profile for email
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', user.id)
        .single();

      // Get jewelry item details
      const { data: jewelryItem } = await supabase
        .from('jewelry_items')
        .select('name, type')
        .eq('id', jewelryItemId)
        .single();

      // Send certificate generated email
      if (userProfile?.email && jewelryItem && result.certificate) {
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            type: 'certificate_generated',
            to: userProfile.email,
            data: {
              certificateId: result.certificate.id,
              recipientEmail: userProfile.email,
              recipientName: userProfile.full_name || 'Usuario',
              jewelryName: jewelryItem.name,
              jewelryType: jewelryItem.type,
              transactionHash: result.certificate.transactionHash,
              verificationUrl: result.certificate.certificateViewUrl || result.certificate.verificationUrl,
              qrCodeUrl: result.certificate.qrCodeUrl
            }
          }
        });

        if (emailError) {
          console.error('Error sending certificate email:', emailError);
          // Don't fail certificate generation if email fails
        }
      }

      return result;

    } catch (error: any) {
      console.error('Certificate generation failed:', error);
      
      let errorMessage = error.message || 'Error generando el certificado NFT';
      
      // Detectar error específico de enum
      if (errorMessage.includes('invalid input value for enum') || errorMessage.includes('jewelry_type')) {
        errorMessage = 'El tipo de joya seleccionado no es compatible con el sistema de certificación. Por favor contacta a soporte.';
      }
      
      toast({
        title: "Error en la certificación",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
        message: 'No se pudo generar el certificado NFT'
      };
    } finally {
      setLoading(false);
    }
  };

  const regenerateCertificate = async (jewelryItemId: string): Promise<CertificateGenerationResult> => {
    return generateCertificate(jewelryItemId);
  };

  return {
    loading,
    generateCertificate,
    regenerateCertificate
  };
}