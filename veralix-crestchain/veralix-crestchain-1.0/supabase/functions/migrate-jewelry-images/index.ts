import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting jewelry images migration...');

    // 1. Get all jewelry_items with images but without main_image_url
    const { data: items, error: fetchError } = await supabase
      .from('jewelry_items')
      .select('id, user_id, images_count')
      .gt('images_count', 0)
      .is('main_image_url', null);

    if (fetchError) {
      throw new Error(`Error fetching jewelry items: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      console.log('✅ No items need migration');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No items need migration',
          fixed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Found ${items.length} items to migrate`);

    const fixed = [];
    const errors = [];
    
    for (const item of items) {
      try {
        console.log(`🔍 Processing jewelry item: ${item.id}`);
        
        // 2. List files in storage for this jewelry item
        const { data: files, error: listError } = await supabase.storage
          .from('jewelry-images')
          .list(`${item.user_id}/${item.id}`);

        if (listError) {
          console.error(`❌ Error listing files for ${item.id}:`, listError);
          errors.push({ id: item.id, error: listError.message });
          continue;
        }

        if (!files || files.length === 0) {
          console.log(`⚠️  No files found for jewelry item: ${item.id}`);
          continue;
        }

        // 3. Sort by created_at to get correct order
        files.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateA - dateB;
        });

        console.log(`📸 Found ${files.length} images for ${item.id}`);

        // 4. Build public URLs
        const imageUrls = files.map(file => 
          `https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/${item.user_id}/${item.id}/${file.name}`
        );

        // 5. Update jewelry_items with URLs
        const { error: updateError } = await supabase
          .from('jewelry_items')
          .update({
            main_image_url: imageUrls[0],
            image_urls: imageUrls,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          console.error(`❌ Error updating ${item.id}:`, updateError);
          errors.push({ id: item.id, error: updateError.message });
          continue;
        }

        // 6. Log audit entry
        await supabase
          .from('audit_logs')
          .insert({
            user_id: item.user_id,
            action: 'image_urls_migrated',
            resource_type: 'jewelry_items',
            resource_id: item.id,
            details: {
              images_migrated: files.length,
              main_image_url: imageUrls[0],
              migration_date: new Date().toISOString()
            }
          });

        console.log(`✅ Successfully migrated ${item.id}`);
        fixed.push({ id: item.id, images: files.length });
        
      } catch (error) {
        console.error(`❌ Unexpected error processing ${item.id}:`, error);
        errors.push({ 
          id: item.id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`✅ Fixed: ${fixed.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fixed: fixed.length,
        errors: errors.length,
        details: {
          fixed_items: fixed,
          error_items: errors
        },
        message: `Successfully migrated ${fixed.length} jewelry items${errors.length > 0 ? `, ${errors.length} errors` : ''}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('💥 Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Migration failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
