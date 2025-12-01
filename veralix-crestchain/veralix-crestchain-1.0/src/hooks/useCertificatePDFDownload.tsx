import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { useToast } from '@/hooks/use-toast';
import { useCertificateCache } from './useCertificateCache';

export const useCertificatePDFDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { getCachedHTML } = useCertificateCache();

  const downloadPDF = async (certificateHtmlUrl: string, certificateId: string) => {
    if (!certificateId) {
      toast({
        title: "ID no disponible",
        description: "No se puede descargar el certificado sin un ID válido",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      toast({
        title: "Generando PDF...",
        description: "Por favor espera mientras se genera tu certificado",
      });

      // SIEMPRE intentar obtener desde caché de Supabase primero (no depender de IPFS)
      console.log('🚀 Obteniendo HTML desde caché de Supabase...');
      const cachedHTML = await getCachedHTML(certificateId);

      let htmlContent: string;
      if (cachedHTML) {
        console.log('✅ Usando HTML desde caché de Supabase');
        htmlContent = cachedHTML;
      } else if (certificateHtmlUrl) {
        // Solo intentar IPFS si hay URL y el caché falló
        console.log('⏳ No en caché, intentando gateways IPFS...');
        
        // Lista de gateways para intentar (ipfs.io primero porque permite HTML)
        const gateways = [
          'https://ipfs.io/ipfs/',
          'https://cloudflare-ipfs.com/ipfs/',
          'https://dweb.link/ipfs/',
          'https://w3s.link/ipfs/',
          'https://gateway.pinata.cloud/ipfs/'  // Pinata al final porque bloquea HTML
        ];
        
        const ipfsHash = certificateHtmlUrl.replace('ipfs://', '').replace(/https?:\/\/[^/]+\/ipfs\//, '');
        let fetched = false;
        
        for (const gateway of gateways) {
          try {
            const response = await fetch(`${gateway}${ipfsHash}`, { 
              signal: AbortSignal.timeout(10000) // 10s timeout
            });
            if (response.ok) {
              const text = await response.text();
              // Verificar que no sea un error de HTML
              if (!text.includes('security reasons') && !text.includes('ERR_ID')) {
                htmlContent = text;
                fetched = true;
                console.log(`✅ HTML obtenido desde ${gateway}`);
                break;
              }
            }
          } catch (e) {
            console.warn(`⚠️ Gateway ${gateway} falló`);
          }
        }
        
        if (!fetched) {
          throw new Error('No se pudo obtener el certificado. Por favor contacta soporte.');
        }
      } else {
        throw new Error('Certificado no disponible. Por favor genera el certificado primero.');
      }
      
      // Create a temporary div to hold the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);
      
      // Progreso: Precargando imágenes
      toast({
        title: "Generando PDF... 30%",
        description: "Precargando imágenes...",
      });

      // Esperar a que TODAS las imágenes se carguen completamente
      const images = tempDiv.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          return new Promise((resolve) => {
            if ((img as HTMLImageElement).complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false); // No bloquear si falla
            }
          });
        })
      );

      // Progreso: Esperando fuentes
      toast({
        title: "Generando PDF... 50%",
        description: "Cargando fuentes...",
      });

      // Esperar a que todas las fuentes estén cargadas
      await document.fonts.ready;

      // Progreso: Renderizando
      toast({
        title: "Generando PDF... 70%",
        description: "Renderizando documento...",
      });
      
      // Configure html2pdf options for high quality - Veralix style (negro y dorado)
      const options = {
        margin: [0, 0, 0, 0] as [number, number, number, number],
        filename: `Certificado-Veralix-${certificateId}.pdf`,
        image: { 
          type: 'jpeg' as const, 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true,
          imageTimeout: 20000,
          backgroundColor: '#0a0a0a', // Fondo negro Veralix
          windowWidth: 794, // A4 width in pixels at 96dpi
          onclone: (clonedDoc: Document) => {
            // Asegurar fuente Baloo Paaji 2 en el documento clonado
            const fontLink = clonedDoc.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@400;500;600;700;800&display=swap';
            fontLink.rel = 'stylesheet';
            clonedDoc.head.appendChild(fontLink);
            
            const styleSheet = clonedDoc.createElement('style');
            styleSheet.textContent = `
              * { font-family: 'Baloo Paaji 2', cursive, sans-serif !important; }
              body { background: #0a0a0a !important; }
            `;
            clonedDoc.head.appendChild(styleSheet);
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as const,
          compress: true,
          precision: 16
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'] 
        }
      };
      
      // Generate and save the PDF
      await html2pdf().set(options).from(tempDiv).save();
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      toast({
        title: "✓ PDF descargado",
        description: "El certificado se ha descargado correctamente",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el certificado. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadPDF, isDownloading };
};
