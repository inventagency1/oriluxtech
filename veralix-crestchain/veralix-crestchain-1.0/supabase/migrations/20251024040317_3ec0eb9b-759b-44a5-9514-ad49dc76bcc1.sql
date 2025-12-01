-- =====================================================
-- SISTEMA DE MODO MANTENIMIENTO CON WAITLIST
-- =====================================================

-- Tabla para configuración global del sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para system_settings
CREATE POLICY "Admins can read system settings"
  ON public.system_settings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert system settings"
  ON public.system_settings FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insertar configuración inicial de modo mantenimiento
INSERT INTO public.system_settings (key, value) 
VALUES ('maintenance_mode', '{"enabled": false, "message": "Estamos realizando mejoras en Veralix. Vuelve pronto.", "estimated_end": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Tabla para almacenar leads de la waitlist
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('joyero', 'cliente', 'otro')),
  company_name TEXT,
  interest_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en waitlist_entries
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON public.waitlist_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_user_type ON public.waitlist_entries(user_type);

-- Políticas RLS para waitlist_entries
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read waitlist"
  ON public.waitlist_entries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update waitlist"
  ON public.waitlist_entries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete waitlist"
  ON public.waitlist_entries FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_waitlist_entries_updated_at
  BEFORE UPDATE ON public.waitlist_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_waitlist_updated_at();

-- Log de auditoría para cambios en modo mantenimiento
CREATE OR REPLACE FUNCTION public.log_maintenance_mode_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.key = 'maintenance_mode' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      auth.uid(),
      'maintenance_mode_changed',
      'system_settings',
      NEW.id::text,
      jsonb_build_object(
        'old_value', OLD.value,
        'new_value', NEW.value,
        'changed_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_maintenance_changes
  AFTER UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_maintenance_mode_change();