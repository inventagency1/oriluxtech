import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const WOMPI_PUBLIC_KEY = Deno.env.get('WOMPI_PUBLIC_KEY');
  const WOMPI_PRIVATE_KEY = Deno.env.get('WOMPI_PRIVATE_KEY');
    
    console.log('🔍 DIAGNÓSTICO WOMPI - Iniciando');
    console.log('📋 Keys disponibles:', {
      publicKeyPresent: !!WOMPI_PUBLIC_KEY,
      publicKeyPrefix: WOMPI_PUBLIC_KEY?.substring(0, 15),
      privateKeyPresent: !!WOMPI_PRIVATE_KEY,
      privateKeyPrefix: WOMPI_PRIVATE_KEY?.substring(0, 15),
    });

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        publicKeyConfigured: !!WOMPI_PUBLIC_KEY,
        privateKeyConfigured: !!WOMPI_PRIVATE_KEY,
        publicKeyValue: WOMPI_PUBLIC_KEY?.substring(0, 20) + '...',
      },
      tests: {} as any,
    };

    // Test 1: Verificar acceptance token
    console.log('🧪 Test 1: Obteniendo acceptance token...');
    try {
      const acceptanceResponse = await fetch('https://production.wompi.co/v1/merchants/' + WOMPI_PUBLIC_KEY, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const acceptanceData = await acceptanceResponse.json();
      console.log('✅ Acceptance response:', acceptanceResponse.status);
      console.log('📦 Acceptance data:', JSON.stringify(acceptanceData, null, 2));
      
      diagnostics.tests.acceptanceToken = {
        status: acceptanceResponse.status,
        success: acceptanceResponse.ok,
        data: acceptanceData,
      };
    } catch (error) {
      console.error('❌ Error obteniendo acceptance token:', error);
      diagnostics.tests.acceptanceToken = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 2: Verificar si podemos crear una transacción de prueba
    console.log('🧪 Test 2: Verificando capacidad de crear transacción...');
    try {
      const testReference = `TEST-${Date.now()}`;
      const testAmount = 10000; // $100 COP
      
      const transactionPayload = {
        acceptance_token: diagnostics.tests.acceptanceToken?.data?.presigned_acceptance?.acceptance_token,
        amount_in_cents: testAmount,
        currency: 'COP',
        reference: testReference,
        customer_email: 'test@veralix.io',
        payment_method: {
          type: 'CARD',
          installments: 1,
        },
        redirect_url: 'https://veralix.io/test',
      };

      console.log('📤 Test transaction payload:', JSON.stringify(transactionPayload, null, 2));

      const transactionResponse = await fetch('https://production.wompi.co/v1/transactions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
        body: JSON.stringify(transactionPayload),
      });

      const transactionData = await transactionResponse.json();
      console.log('📥 Test transaction response:', transactionResponse.status);
      console.log('📦 Test transaction data:', JSON.stringify(transactionData, null, 2));

      diagnostics.tests.createTransaction = {
        status: transactionResponse.status,
        success: transactionResponse.ok,
        data: transactionData,
      };
    } catch (error) {
      console.error('❌ Error creando transacción de prueba:', error);
      diagnostics.tests.createTransaction = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Test 3: Verificar merchant info usando private key
    if (WOMPI_PRIVATE_KEY) {
      console.log('🧪 Test 3: Verificando información del merchant...');
      try {
        const merchantResponse = await fetch('https://production.wompi.co/v1/merchants/' + WOMPI_PUBLIC_KEY, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
          },
        });

        const merchantData = await merchantResponse.json();
        console.log('✅ Merchant response:', merchantResponse.status);
        console.log('📦 Merchant data:', JSON.stringify(merchantData, null, 2));

        diagnostics.tests.merchantInfo = {
          status: merchantResponse.status,
          success: merchantResponse.ok,
          data: merchantData,
        };
      } catch (error) {
        console.error('❌ Error obteniendo merchant info:', error);
        diagnostics.tests.merchantInfo = {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    // Análisis de resultados
    const analysis = {
      publicKeyValid: diagnostics.tests.acceptanceToken?.success || false,
      canCreateTransactions: diagnostics.tests.createTransaction?.success || false,
      merchantActive: diagnostics.tests.merchantInfo?.success || false,
      recommendations: [] as string[],
    };

    if (!analysis.publicKeyValid) {
      analysis.recommendations.push('❌ La clave pública no es válida o la cuenta no está activa en Wompi');
    }

    if (!analysis.canCreateTransactions && diagnostics.tests.createTransaction?.data) {
      const errorData = diagnostics.tests.createTransaction.data;
      if (errorData.error) {
        const errorMsg = typeof errorData.error.messages === 'object' 
          ? JSON.stringify(errorData.error.messages)
          : errorData.error.messages;
        analysis.recommendations.push(`❌ Error de Wompi: ${errorData.error.type} - ${errorMsg}`);
      }
    }

    if (diagnostics.tests.merchantInfo?.data?.data?.status === 'inactive') {
      analysis.recommendations.push('⚠️ La cuenta de merchant está INACTIVA en Wompi');
    }

    console.log('📊 ANÁLISIS FINAL:', JSON.stringify(analysis, null, 2));

    return new Response(
      JSON.stringify({ diagnostics, analysis }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
