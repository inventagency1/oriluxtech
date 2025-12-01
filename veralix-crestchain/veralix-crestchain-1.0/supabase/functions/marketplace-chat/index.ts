import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, jewelryName, price, currency, sellerName, jewelryType, jewelryImages, listingId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Crear cliente de Supabase para consultar productos similares
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Consultar productos similares de la misma categoría
    const { data: similarProducts } = await supabase
      .from('marketplace_listings_complete')
      .select('id, jewelry_name, price, currency, jewelry_type, jewelry_main_image_url, seller_full_name')
      .eq('status', 'active')
      .eq('jewelry_type', jewelryType)
      .neq('id', listingId)
      .limit(5);

    // Preparar información de productos similares
    const alternativesContext = similarProducts && similarProducts.length > 0
      ? `\n\nProductos similares disponibles en el marketplace:\n${similarProducts.map((p, i) => 
          `${i + 1}. ${p.jewelry_name} - ${p.currency} ${p.price} (Vendedor: ${p.seller_full_name || 'N/A'})`
        ).join('\n')}`
      : '';

    const isGeneralMode = listingId === 'general';

    // Sistema prompt con análisis visual y recomendaciones
    const systemPrompt = isGeneralMode 
      ? `Eres un asistente de ventas experto en joyería con capacidad de análisis visual para Veralix Marketplace.

MODO: Asistente General del Marketplace

CAPACIDADES DE ANÁLISIS VISUAL:
- Puedes analizar las imágenes de las joyas para identificar características como:
  * Tipo de metal (oro, plata, platino)
  * Piedras preciosas y su calidad
  * Estilo y diseño (clásico, moderno, vintage)
  * Acabados y detalles artesanales
  * Estado de conservación

TUS FUNCIONES:
1. 🔍 AYUDAR al cliente a encontrar la joya perfecta preguntando sobre sus preferencias
2. 💎 SUGERIR categorías y tipos de productos según las necesidades del cliente
3. 📸 RECOMENDAR que explore productos específicos basándote en su búsqueda
4. 💰 INFORMAR sobre rangos de precios y opciones disponibles
5. 🔄 GUIAR al cliente para que encuentre el producto ideal
6. 💬 EXPLICAR el proceso de compra por WhatsApp
7. 🔒 INFORMAR sobre certificados NFT blockchain de Veralix

ESTRATEGIA DE RECOMENDACIÓN:
- Pregunta al cliente qué tipo de joya busca (anillo, collar, pulsera, aretes)
- Indaga sobre estilo preferido (clásico, moderno, minimalista)
- Consulta sobre presupuesto aproximado
- Pregunta sobre ocasión de uso (diario, especial, regalo)
- Sugiere categorías basadas en sus respuestas

INFORMACIÓN IMPORTANTE:
- Las compras se realizan directamente con el vendedor por WhatsApp
- Cada joya tiene certificado NFT en blockchain Polygon
- Veralix garantiza autenticidad de todas las joyas
- Los certificados son transferibles entre usuarios

TONO: Profesional, amigable y consultivo. Usa emojis moderadamente. Haz preguntas para entender mejor las necesidades del cliente.`
      : `Eres un asistente de ventas experto en joyería con capacidad de análisis visual para Veralix Marketplace.

PRODUCTO ACTUAL:
- Nombre: ${jewelryName}
- Tipo: ${jewelryType}
- Precio: ${currency} ${price}
- Vendedor: ${sellerName}
${alternativesContext}

CAPACIDADES DE ANÁLISIS VISUAL:
- Puedes analizar las imágenes de las joyas para identificar características como:
  * Tipo de metal (oro, plata, platino)
  * Piedras preciosas y su calidad
  * Estilo y diseño (clásico, moderno, vintage)
  * Acabados y detalles artesanales
  * Estado de conservación

TUS FUNCIONES:
1. 📸 ANALIZAR las imágenes del producto cuando el cliente pregunte sobre características visuales
2. 💎 SUGERIR este producto si coincide con las necesidades del cliente
3. 🔄 RECOMENDAR alternativas similares cuando sea apropiado
4. 📋 COMPARAR productos visualmente si el cliente lo solicita
5. ✨ DESTACAR características únicas basadas en el análisis visual
6. 💬 EXPLICAR el proceso de compra por WhatsApp
7. 🔒 INFORMAR sobre certificados NFT blockchain de Veralix

ESTRATEGIA DE RECOMENDACIÓN:
- Si el cliente busca una categoría específica (anillos, collares, etc.), sugiere productos similares
- Si pregunta sobre características visuales, analiza las imágenes detalladamente
- Si menciona presupuesto, compara precios con alternativas
- Siempre prioriza ayudar al cliente a encontrar la joya perfecta

INFORMACIÓN IMPORTANTE:
- Las compras se realizan directamente con el vendedor por WhatsApp
- Cada joya tiene certificado NFT en blockchain Polygon
- Veralix garantiza autenticidad
- Los certificados son transferibles entre usuarios

TONO: Profesional, amigable y experto. Usa emojis moderadamente. Sé específico al analizar imágenes.`;

    // Preparar el primer mensaje con imágenes si las hay (solo en modo específico)
    const messagesWithImages = [...messages];
    
    // Si es el primer mensaje del usuario, hay imágenes y NO es modo general, agregar análisis visual
    if (messages.length === 1 && jewelryImages && jewelryImages.length > 0 && !isGeneralMode) {
      messagesWithImages[0] = {
        role: "user",
        content: [
          {
            type: "text",
            text: `${messages[0].content}\n\n[El asistente puede ver ${jewelryImages.length} imagen(es) del producto para análisis detallado]`
          },
          ...jewelryImages.slice(0, 3).map((url: string) => ({
            type: "image_url",
            image_url: { url }
          }))
        ]
      };
    }

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
          ...messagesWithImages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos momentos." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servicio temporalmente no disponible." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error en el servicio de chat" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
