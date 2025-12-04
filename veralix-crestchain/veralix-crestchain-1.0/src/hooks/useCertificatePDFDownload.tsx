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

      let htmlContent: string = '';
      
      if (cachedHTML) {
        console.log('✅ Usando HTML desde caché de Supabase');
        htmlContent = cachedHTML;
      } else if (certificateHtmlUrl) {
        // Solo intentar IPFS si hay URL y el caché falló
        console.log('⏳ No en caché, intentando gateways IPFS...');
        console.log('📍 URL del certificado:', certificateHtmlUrl);
        
        // Lista de gateways para intentar (ordenados por confiabilidad)
        const gateways = [
          'https://ipfs.io/ipfs/',
          'https://cloudflare-ipfs.com/ipfs/',
          'https://dweb.link/ipfs/',
          'https://w3s.link/ipfs/',
          'https://nftstorage.link/ipfs/',
          'https://4everland.io/ipfs/'
        ];
        
        // Extraer hash de IPFS de diferentes formatos
        let ipfsHash = certificateHtmlUrl;
        if (ipfsHash.startsWith('ipfs://')) {
          ipfsHash = ipfsHash.replace('ipfs://', '');
        } else if (ipfsHash.includes('/ipfs/')) {
          ipfsHash = ipfsHash.split('/ipfs/')[1];
        }
        
        console.log('🔑 IPFS Hash:', ipfsHash);
        let fetched = false;
        
        for (const gateway of gateways) {
          try {
            const fullUrl = `${gateway}${ipfsHash}`;
            console.log(`🌐 Intentando: ${fullUrl}`);
            
            const response = await fetch(fullUrl, { 
              signal: AbortSignal.timeout(15000), // 15s timeout
              headers: {
                'Accept': 'text/html,application/xhtml+xml,*/*'
              }
            });
            
            console.log(`📡 Respuesta de ${gateway}: ${response.status}`);
            
            if (response.ok) {
              const text = await response.text();
              console.log(`📄 Contenido recibido: ${text.length} caracteres`);
              
              // Verificar que sea HTML válido y no un error
              if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
                if (!text.includes('security reasons') && !text.includes('ERR_ID') && !text.includes('429')) {
                  htmlContent = text;
                  fetched = true;
                  console.log(`✅ HTML obtenido desde ${gateway} (${text.length} chars)`);
                  break;
                }
              }
            }
          } catch (e) {
            console.warn(`⚠️ Gateway ${gateway} falló:`, e);
          }
        }
        
        if (!fetched || !htmlContent) {
          console.error('❌ No se pudo obtener HTML de ningún gateway');
          throw new Error('No se pudo obtener el certificado de IPFS. Intenta "Ver en IPFS" directamente.');
        }
      } else {
        throw new Error('Certificado no disponible. Por favor genera el certificado primero.');
      }
      
      // Verificar que tenemos contenido HTML
      if (!htmlContent || htmlContent.length < 100) {
        console.error('❌ HTML vacío o muy corto:', htmlContent?.length);
        throw new Error('El contenido del certificado está vacío. Intenta "Ver en IPFS".');
      }
      
      console.log('📋 HTML listo para renderizar:', htmlContent.substring(0, 200) + '...');
      
      // Create a temporary container for the certificate HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Estilos para renderizado correcto (visible pero fuera de vista del usuario)
      tempDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 794px;
        min-height: 1123px;
        background: #0a0a0a;
        z-index: -9999;
        opacity: 0;
        pointer-events: none;
        overflow: visible;
      `;
      
      document.body.appendChild(tempDiv);
      
      // Forzar que los estilos del HTML se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
          scale: 2,
          useCORS: true,
          logging: true, // Activar logging para debug
          letterRendering: true,
          allowTaint: true,
          imageTimeout: 30000,
          backgroundColor: '#0a0a0a',
          width: 794,
          height: 1123,
          windowWidth: 794,
          windowHeight: 1123,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document, element: HTMLElement) => {
            console.log('🎨 Clonando documento para PDF...');
            
            // Asegurar que el elemento clonado sea visible
            element.style.opacity = '1';
            element.style.position = 'relative';
            element.style.left = '0';
            element.style.top = '0';
            element.style.background = '#0a0a0a';
            
            // Agregar fuentes
            const fontLink = clonedDoc.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@400;500;600;700;800&display=swap';
            fontLink.rel = 'stylesheet';
            clonedDoc.head.appendChild(fontLink);
            
            // Forzar estilos
            const styleSheet = clonedDoc.createElement('style');
            styleSheet.textContent = `
              * { font-family: 'Baloo Paaji 2', cursive, sans-serif !important; }
              html, body { 
                background: #0a0a0a !important; 
                margin: 0 !important;
                padding: 0 !important;
              }
            `;
            clonedDoc.head.appendChild(styleSheet);
            
            console.log('✅ Documento clonado y estilos aplicados');
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
        description: "No se pudo generar el certificado. Abriendo en nueva pestaña...",
        variant: "destructive",
      });
      
      // Fallback: abrir directamente en IPFS si la generación falla
      if (certificateHtmlUrl) {
        const ipfsHash = certificateHtmlUrl.replace('ipfs://', '').replace(/https?:\/\/[^/]+\/ipfs\//, '');
        window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Función para abrir directamente en IPFS (sin generar PDF)
  const openInIPFS = (certificateHtmlUrl: string) => {
    if (!certificateHtmlUrl) return;
    const ipfsHash = certificateHtmlUrl.replace('ipfs://', '').replace(/https?:\/\/[^/]+\/ipfs\//, '');
    window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank');
  };

  return { downloadPDF, openInIPFS, isDownloading };
};
