import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticación y rol admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { listing_id } = await req.json();

    if (!listing_id) {
      return new Response(JSON.stringify({ error: 'listing_id requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✍️ Mejorando descripción para listing: ${listing_id}`);

    // 1. Obtener información completa del listing
    const { data: listing, error: listingError } = await supabase
      .from('marketplace_listings_complete')
      .select('*')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      throw new Error('Listing no encontrado');
    }

    // 2. Construir prompt para AI
    const materials = listing.jewelry_materials?.join(', ') || 'materiales preciosos';
    const weight = listing.jewelry_weight ? `${listing.jewelry_weight}g` : '';
    const price = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: listing.currency || 'COP',
      minimumFractionDigits: 0
    }).format(listing.price);

    const prompt = `Eres un experto en joyería de lujo. Genera una descripción profesional en español para:

Tipo: ${listing.jewelry_type}
Nombre: ${listing.jewelry_name}
Materiales: ${materials}
${weight ? `Peso: ${weight}` : ''}
Precio: ${price}

Crea una descripción de 2-3 párrafos (máximo 150 palabras) que incluya:
1. Características técnicas y materiales
2. Diseño y estilo (elegancia, artesanía)
3. Ocasión de uso recomendada

Tono: Profesional, elegante, aspiracional. Sin exageraciones.
Responde SOLO con la descripción, sin prefijos como "Descripción:" ni formato markdown.`;

    console.log('📝 Generando descripción con AI...');

    // 3. Llamar a Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Error AI Gateway:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const enhancedDescription = aiData.choices?.[0]?.message?.content?.trim();

    if (!enhancedDescription) {
      throw new Error('No se generó descripción');
    }

    console.log('✅ Descripción generada:', enhancedDescription.substring(0, 100) + '...');

    // 4. Actualizar listing en DB
    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({
        description: enhancedDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', listing_id);

    if (updateError) throw updateError;

    console.log('✅ Descripción actualizada en DB');

    // 5. Log de auditoría
    await supabase.rpc('log_audit_action', {
      _action: 'ai_description_enhanced',
      _resource_type: 'marketplace_listings',
      _resource_id: listing_id,
      _details: {
        jewelry_type: listing.jewelry_type,
        old_description: listing.description?.substring(0, 50) || 'vacía',
        new_description: enhancedDescription.substring(0, 50)
      }
    });

    return new Response(JSON.stringify({
      success: true,
      enhanced_description: enhancedDescription,
      listing_id: listing_id,
      message: 'Descripción mejorada exitosamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error mejorando descripción:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
