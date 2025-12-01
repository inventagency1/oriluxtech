-- ============================================================
-- FIX: Políticas RLS para jewelry_items
-- Error: "new row violates row-level security policy"
-- ============================================================

-- Primero, eliminar políticas existentes que puedan estar en conflicto
DROP POLICY IF EXISTS "Users can create their own jewelry items" ON public.jewelry_items;
DROP POLICY IF EXISTS "Users can view their own jewelry items" ON public.jewelry_items;
DROP POLICY IF EXISTS "Users can update their own jewelry items" ON public.jewelry_items;
DROP POLICY IF EXISTS "Users can delete their own jewelry items" ON public.jewelry_items;

-- Recrear políticas más permisivas para usuarios autenticados
CREATE POLICY "Users can view their own jewelry items" 
ON public.jewelry_items FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jewelry items" 
ON public.jewelry_items FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jewelry items" 
ON public.jewelry_items FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jewelry items" 
ON public.jewelry_items FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Política para service_role (Edge Functions)
CREATE POLICY "Service role can manage all jewelry items"
ON public.jewelry_items FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- También arreglar nft_certificates
-- ============================================================

DROP POLICY IF EXISTS "Users can create certificates for their jewelry" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can update their own certificates" ON public.nft_certificates;
DROP POLICY IF EXISTS "Anyone can verify certificates by certificate_id" ON public.nft_certificates;

CREATE POLICY "Users can view their own certificates" 
ON public.nft_certificates FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create certificates for their jewelry" 
ON public.nft_certificates FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certificates" 
ON public.nft_certificates FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Acceso público para verificación de certificados
CREATE POLICY "Anyone can verify certificates" 
ON public.nft_certificates FOR SELECT 
TO anon, authenticated
USING (certificate_id IS NOT NULL);

-- Service role para Edge Functions
CREATE POLICY "Service role can manage all certificates"
ON public.nft_certificates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
