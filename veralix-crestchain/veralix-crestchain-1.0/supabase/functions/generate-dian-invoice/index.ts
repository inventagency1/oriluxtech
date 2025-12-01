import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceRequest {
  transaction_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { transaction_id } = await req.json() as InvoiceRequest;

    console.log('🧾 Starting DIAN invoice generation for transaction:', transaction_id);

    // 1. Obtener información de la transacción
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        user_id,
        amount,
        currency,
        type,
        metadata
      `)
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      throw new Error(`Transaction not found: ${txError?.message}`);
    }

    // Verificar que el pago esté completado
    if (transaction.status !== 'completed') {
      throw new Error('Transaction must be completed before generating invoice');
    }

    // Verificar si ya tiene factura
    if (transaction.invoice_number) {
      console.log('⚠️ Invoice already exists for this transaction');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invoice already exists',
          invoice_number: transaction.invoice_number,
          cufe: transaction.cufe,
          pdf_url: transaction.invoice_pdf_url
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Obtener datos fiscales del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email, phone, tax_id, tax_regime, fiscal_address')
      .eq('user_id', transaction.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`);
    }

    // 3. Validar datos fiscales completos
    if (!profile.tax_id || !profile.fiscal_address) {
      throw new Error('Incomplete fiscal data. User must complete NIT and fiscal address');
    }

    const fiscalAddress = profile.fiscal_address as any;
    if (!fiscalAddress.city || !fiscalAddress.department) {
      throw new Error('Incomplete fiscal address. City and department are required');
    }

    console.log('✅ Fiscal data validated for user:', transaction.user_id);

    // 4. Preparar payload para Facturalatam API
    const facturalatamApiKey = Deno.env.get('FACTURALATAM_API_KEY');
    const facturalatamCompanyId = Deno.env.get('FACTURALATAM_COMPANY_ID');

    if (!facturalatamApiKey || !facturalatamCompanyId) {
      throw new Error('Facturalatam API credentials not configured');
    }

    // Determinar descripción del item según tipo de transacción
    let itemDescription = 'Certificado NFT Digital';
    if (transaction.metadata) {
      const metadata = transaction.metadata as any;
      if (metadata.jewelry_name) {
        itemDescription = `Certificado NFT - ${metadata.jewelry_name}`;
      } else if (metadata.package_name) {
        itemDescription = `${metadata.package_name} - Paquete de Certificados`;
      }
    }

    const invoicePayload = {
      company_id: facturalatamCompanyId,
      customer: {
        type: profile.tax_id.length > 10 ? 'company' : 'person',
        document_type: profile.tax_id.length > 10 ? 'NIT' : 'CC',
        document: profile.tax_id,
        name: profile.full_name || 'Cliente',
        email: profile.email,
        phone: profile.phone || '',
        address: fiscalAddress.street || fiscalAddress.address || '',
        city: fiscalAddress.city,
        department: fiscalAddress.department
      },
      items: [
        {
          code: transaction.type === 'certificate_purchase' ? 'CERT-PKG' : 'CERT-001',
          description: itemDescription,
          quantity: 1,
          unit_price: Number(transaction.amount),
          tax_rate: 19, // IVA Colombia
          discount: 0
        }
      ],
      payment_method: '42', // Pago electrónico - Bold.co
      notes: `Transacción ID: ${transaction_id}`,
      send_email: true
    };

    console.log('📤 Sending invoice request to Facturalatam...');

    // 5. Llamar a Facturalatam API
    const facturalatamResponse = await fetch('https://api.facturalatam.com/api/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${facturalatamApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(invoicePayload)
    });

    if (!facturalatamResponse.ok) {
      const errorText = await facturalatamResponse.text();
      console.error('❌ Facturalatam API error:', errorText);
      throw new Error(`Facturalatam API error: ${facturalatamResponse.status} - ${errorText}`);
    }

    const invoiceData = await facturalatamResponse.json();
    console.log('✅ Invoice generated successfully:', invoiceData.invoice_number);

    // 6. Actualizar transacción con datos de factura
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        invoice_number: invoiceData.invoice_number,
        cufe: invoiceData.cufe,
        invoice_pdf_url: invoiceData.pdf_url,
        invoice_xml_url: invoiceData.xml_url,
        dian_status: 'issued',
        invoice_issued_at: new Date().toISOString(),
        customer_tax_id: profile.tax_id
      })
      .eq('id', transaction_id);

    if (updateError) {
      console.error('❌ Error updating transaction:', updateError);
      throw updateError;
    }

    // 7. Registrar en audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: transaction.user_id,
        action: 'dian_invoice_generated',
        resource_type: 'transaction',
        resource_id: transaction_id,
        details: {
          invoice_number: invoiceData.invoice_number,
          cufe: invoiceData.cufe,
          amount: transaction.amount,
          customer_tax_id: profile.tax_id
        }
      });

    // 8. Enviar email con factura al cliente
    console.log('📧 Sending invoice email to customer...');
    
    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        type: 'invoice_generated',
        data: {
          customer_name: profile.full_name,
          invoice_number: invoiceData.invoice_number,
          invoice_pdf_url: invoiceData.pdf_url,
          amount: transaction.amount,
          currency: transaction.currency,
          transaction_id: transaction_id
        }
      }
    });

    console.log('✅ DIAN invoice generation completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        invoice_number: invoiceData.invoice_number,
        cufe: invoiceData.cufe,
        pdf_url: invoiceData.pdf_url,
        xml_url: invoiceData.xml_url,
        qr_code: invoiceData.qr_code
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error generating DIAN invoice:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate invoice'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
