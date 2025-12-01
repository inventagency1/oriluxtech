import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Code, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvoiceDownloadButtonProps {
  transactionId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export function InvoiceDownloadButton({ 
  transactionId, 
  variant = 'outline',
  size = 'sm',
  showLabel = true
}: InvoiceDownloadButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const downloadInvoice = async (format: 'pdf' | 'xml') => {
    try {
      setLoading(true);

      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        throw new Error('No se pudo obtener la información de la factura');
      }

      const invoiceData = transaction as any;
      if (!invoiceData.invoice_number) {
        toast({
          title: "Factura no disponible",
          description: "La factura aún no ha sido generada. Esto puede tomar unos minutos después del pago.",
          variant: "default",
        });
        return;
      }

      if (invoiceData.dian_status === 'failed') {
        toast({
          title: "Error en la factura",
          description: "Hubo un problema al generar la factura. Por favor contacta a soporte.",
          variant: "destructive",
        });
        return;
      }

      const url = format === 'pdf' ? invoiceData.invoice_pdf_url : invoiceData.invoice_xml_url;
      
      if (!url) {
        toast({
          title: "Archivo no disponible",
          description: "La factura se está procesando. Por favor intenta nuevamente en unos momentos.",
          variant: "default",
        });
        return;
      }

      // Abrir factura en nueva pestaña
      window.open(url, '_blank');

      toast({
        title: "Descargando factura",
        description: `Factura ${invoiceData.invoice_number} - Formato ${format.toUpperCase()}`,
      });

    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Error al descargar",
        description: error.message || "No se pudo descargar la factura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {showLabel && <span className="ml-2">Descargar Factura</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => downloadInvoice('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          Descargar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadInvoice('xml')}>
          <Code className="h-4 w-4 mr-2" />
          Descargar XML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
