import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JEWELRY_PROMPTS: Record<string, string> = {
  anillo: "Professional product photography of an elegant gold ring with diamonds, on pure white background, studio lighting, high resolution, jewelry catalog style, luxury, sharp focus, 4K quality",
  cadena: "Professional product photography of a beautiful gold chain necklace, on pure white background, studio lighting, high resolution, jewelry catalog style, elegant display, 4K quality",
  dije: "Professional product photography of an exquisite gold pendant, on pure white background, studio lighting, high resolution, jewelry catalog style, luxury craftsmanship, 4K quality",
  pendientes: "Professional product photography of elegant gold earrings, on pure white background, studio lighting, high resolution, jewelry catalog style, luxury pair, 4K quality",
  pulsera: "Professional product photography of a stunning gold bracelet, on pure white background, studio lighting, high resolution, jewelry catalog style, elegant design, 4K quality",
  collar: "Professional product photography of a beautiful gold necklace, on pure white background, studio lighting, high resolution, jewelry catalog style, luxury piece, 4K quality"
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

    const { jewelry_item_id } = await req.json();

    if (!jewelry_item_id) {
      return new Response(JSON.stringify({ error: 'jewelry_item_id requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`🎨 Generando imagen para item: ${jewelry_item_id}`);

    // 1. Obtener información del item
    const { data: item, error: itemError } = await supabase
      .from('jewelry_items')
      .select('*')
      .eq('id', jewelry_item_id)
      .single();

    if (itemError || !item) {
      throw new Error('Item no encontrado');
    }

    // 2. Determinar tipo de joya y prompt
    const jewelryType = item.type?.toLowerCase() || 'anillo';
    const basePrompt = JEWELRY_PROMPTS[jewelryType] || JEWELRY_PROMPTS.anillo;
    
    // Enriquecer prompt con materiales si están disponibles
    let enrichedPrompt = basePrompt;
    if (item.materials && item.materials.length > 0) {
      const materials = item.materials.join(', ');
      enrichedPrompt = basePrompt.replace('gold', materials);
    }

    console.log(`📝 Prompt: ${enrichedPrompt}`);

    // 3. Llamar a Lovable AI Gateway para generar imagen
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{
          role: "user",
          content: enrichedPrompt
        }],
        modalities: ["image", "text"]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Error AI Gateway:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const imageBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      throw new Error('No se generó imagen');
    }

    console.log('✅ Imagen generada con AI');

    // 4. Convertir base64 a blob y subir a Storage
    const base64Data = imageBase64.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `${item.user_id}/${item.id}/ai-generated-main.jpg`;
    
    // Eliminar imagen anterior si existe
    await supabase.storage
      .from('jewelry-images')
      .remove([fileName]);

    // Subir nueva imagen
    const { error: uploadError } = await supabase.storage
      .from('jewelry-images')
      .upload(fileName, bytes, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    console.log('✅ Imagen subida a Storage');

    // 5. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('jewelry-images')
      .getPublicUrl(fileName);

    // 6. Actualizar item en DB
    const { error: updateError } = await supabase
      .from('jewelry_items')
      .update({
        main_image_url: publicUrl,
        images_count: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', jewelry_item_id);

    if (updateError) throw updateError;

    console.log('✅ DB actualizada con nueva imagen');

    // 7. Log de auditoría
    await supabase.rpc('log_audit_action', {
      _action: 'ai_image_generated',
      _resource_type: 'jewelry_items',
      _resource_id: jewelry_item_id,
      _details: {
        jewelry_type: jewelryType,
        image_url: publicUrl,
        prompt_used: enrichedPrompt
      }
    });

    return new Response(JSON.stringify({
      success: true,
      image_url: publicUrl,
      jewelry_item_id: jewelry_item_id,
      message: 'Imagen generada exitosamente'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error generando imagen:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
