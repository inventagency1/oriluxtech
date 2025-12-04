-- ============================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- Asignar rol de Admin a tu usuario
-- ============================================

-- PASO 1: Ver usuarios existentes (para obtener tu user_id)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- PASO 2: Asignar rol de admin
-- REEMPLAZA 'tu-email@ejemplo.com' con tu email real
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'inventagency20@gmail.com'; -- <-- CAMBIA ESTO POR TU EMAIL
BEGIN
  -- Buscar el usuario
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Usuario no encontrado: %', v_email;
    RETURN;
  END IF;
  
  -- Insertar o actualizar rol
  INSERT INTO user_roles (user_id, role, created_at, updated_at)
  VALUES (v_user_id, 'admin', NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin', updated_at = NOW();
  
  RAISE NOTICE 'Usuario % asignado como ADMIN exitosamente', v_email;
END $$;

-- PASO 3: Verificar que se asignó correctamente
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- ============================================
-- ALTERNATIVA: Si la tabla user_roles no existe, créala primero:
-- ============================================
/*
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'joyero', 'cliente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios lean su propio rol
CREATE POLICY "Users can read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Política para que admins lean todos los roles
CREATE POLICY "Admins can read all roles"
  ON user_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
*/
