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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar que el usuario es admin
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

    // Verificar rol admin
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

    console.log('🧹 Iniciando limpieza del marketplace...');

    // 1. Buscar productos problemáticos
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select(`
        id,
        jewelry_item_id,
        price,
        description,
        status,
        jewelry_items!inner (
          id,
          name,
          images_count,
          created_at
        )
      `)
      .eq('status', 'active');

    if (listingsError) throw listingsError;

    const problematicListings = [];
    const reasons: Record<string, string[]> = {};

    for (const listing of listings || []) {
      const item = listing.jewelry_items as any;
      const listingReasons: string[] = [];

      // Detectar productos de prueba
      if (item.name.toLowerCase().includes('prueba')) {
        listingReasons.push('Contiene "prueba" en el nombre');
      }

      // Sin imágenes
      if (!item.images_count || item.images_count === 0) {
        listingReasons.push('Sin imágenes');
      }

      // Precios irreales (> 100 millones COP)
      if (listing.price > 100_000_000) {
        listingReasons.push(`Precio irreal: $${listing.price.toLocaleString()} COP`);
      }

      // Descripción vacía en productos viejos (> 7 días)
      const createdDate = new Date(item.created_at);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if ((!listing.description || listing.description.trim().length < 10) && daysSinceCreation > 7) {
        listingReasons.push('Sin descripción válida hace más de 7 días');
      }

      // Nombres sin sentido (muy cortos o solo números)
      if (item.name.length < 5 || /^\d+$/.test(item.name)) {
        listingReasons.push('Nombre inválido o sin sentido');
      }

      if (listingReasons.length > 0) {
        problematicListings.push(listing.id);
        reasons[listing.id] = listingReasons;
      }
    }

    console.log(`❌ Encontrados ${problematicListings.length} productos problemáticos`);

    // 2. Soft delete (cambiar status a 'deleted')
    if (problematicListings.length > 0) {
      const { error: deleteError } = await supabase
        .from('marketplace_listings')
        .update({ status: 'deleted' })
        .in('id', problematicListings);

      if (deleteError) throw deleteError;
    }

    // 3. Registrar en audit log
    await supabase.rpc('log_audit_action', {
      _action: 'marketplace_cleanup',
      _resource_type: 'marketplace_listings',
      _details: {
        cleaned_count: problematicListings.length,
        reasons: reasons,
        timestamp: new Date().toISOString()
      }
    });

    // 4. Retornar resumen
    return new Response(JSON.stringify({
      success: true,
      cleaned_count: problematicListings.length,
      cleaned_ids: problematicListings,
      reasons: reasons,
      message: `Se limpiaron ${problematicListings.length} productos problemáticos`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error en cleanup:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
