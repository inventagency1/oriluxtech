import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY no configurado");
      throw new Error("LOVABLE_API_KEY no configurado");
    }

    const systemPrompt = `Eres un asistente de soporte especializado en Veralix, una plataforma de certificación blockchain para joyerías en Colombia.

Tu rol:
- Responder preguntas sobre certificación NFT, uso del Marketplace, precios, funcionalidades y servicios de Veralix
- Usar tono profesional, claro y amigable enfocado en joyerías (B2B)
- Si no sabes algo o la consulta requiere soporte humano (pagos, problemas técnicos complejos, verificación de identidad), indica claramente que se debe contactar al equipo vía WhatsApp o email

IMPORTANTE: Detección de consultas de compra de joyas
- Si el usuario pregunta específicamente por comprar, ver, buscar o consultar sobre joyas/piezas específicas (anillos, collares, aretes, etc.)
- Responde: "Para ayudarte con la compra de joyas, te recomiendo usar nuestro **Chat de Ventas Especializado** en el Marketplace. Está diseñado para asesorarte en tiempo real sobre productos específicos, precios, disponibilidad y conectarte directamente con los joyeros. [ABRIR_CHAT_VENTAS]"
- NO respondas preguntas específicas sobre joyas individuales, inventario o precios de productos

Información clave de Veralix:
- Plataforma de certificación blockchain para autenticar joyas
- Usa blockchain Polygon (MATIC) para certificados NFT inmutables
- Paquetes prepagados: 10, 50 o 100 certificados
- Email: soporte@veralix.io
- Operador: Orilux Tech S.A.S. (NIT 901.988.949-2)
- Dominio oficial: veralix.io y oriluxtech.com
- Marketplace para compra/venta de joyas certificadas
- Transferencia de certificados entre usuarios
- Verificación de autenticidad mediante QR o código

Servicios principales:
1. Certificación NFT de joyas con blockchain
2. Marketplace B2C para joyerías con Chat de Ventas IA
3. Verificación de autenticidad para clientes
4. Gestión de inventario certificado
5. Transferencia segura de certificados

Si el usuario necesita:
- Consultas de compra de joyas específicas → redirige al Chat de Ventas del Marketplace [ABRIR_CHAT_VENTAS]
- Soporte técnico avanzado → recomienda contactar por WhatsApp o soporte@veralix.io
- Información sobre pagos o facturación → recomienda contactar por email
- Problemas con certificados o cuenta → recomienda contactar soporte humano
- Preguntas no relacionadas con Veralix → indica que solo puedes ayudar con temas de Veralix

Mantén respuestas concisas (máximo 3-4 párrafos) y enfocadas.`;

    console.log("Enviando mensaje a Lovable AI Gateway");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de consultas alcanzado. Por favor intenta en unos minutos o contacta soporte@veralix.io" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio temporalmente no disponible. Por favor contacta soporte@veralix.io" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    console.log("Streaming respuesta del AI");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error en ai-support-chat:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error del servidor. Por favor contacta soporte@veralix.io" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
