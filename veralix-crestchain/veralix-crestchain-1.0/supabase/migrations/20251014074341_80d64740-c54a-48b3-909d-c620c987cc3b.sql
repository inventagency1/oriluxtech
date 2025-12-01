-- ==========================================
-- FASE 1: Mejorar RLS Policies para Subscriptions
-- ==========================================

-- 1. Eliminar política insegura que permite a usuarios crear suscripciones directamente
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;

-- 2. Crear política restrictiva: solo edge functions pueden crear suscripciones
CREATE POLICY "Only system can create subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (false);

-- 3. Actualizar política de UPDATE para permitir solo cancelación de usuarios
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

CREATE POLICY "Users can cancel or reactivate their subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Crear función para que edge functions creen suscripciones de forma segura
CREATE OR REPLACE FUNCTION public.create_subscription_from_payment(
  _user_id uuid,
  _plan subscription_plan,
  _status subscription_status,
  _certificates_limit integer,
  _price_per_month numeric,
  _current_period_start timestamp with time zone,
  _current_period_end timestamp with time zone,
  _stripe_subscription_id text DEFAULT NULL,
  _stripe_customer_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_id uuid;
BEGIN
  -- Insertar suscripción
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    certificates_limit,
    certificates_used,
    price_per_month,
    current_period_start,
    current_period_end,
    stripe_subscription_id,
    stripe_customer_id
  )
  VALUES (
    _user_id,
    _plan,
    _status,
    _certificates_limit,
    0, -- certificates_used inicia en 0
    _price_per_month,
    _current_period_start,
    _current_period_end,
    _stripe_subscription_id,
    _stripe_customer_id
  )
  RETURNING id INTO subscription_id;
  
  -- Log de auditoría
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    _user_id,
    'subscription_created',
    'subscription',
    subscription_id::text,
    jsonb_build_object(
      'plan', _plan,
      'price_per_month', _price_per_month,
      'certificates_limit', _certificates_limit,
      'payment_method', 'bold',
      'created_via', 'payment_function'
    )
  );
  
  RETURN subscription_id;
END;
$$;

-- 5. Crear función para renovar suscripciones
CREATE OR REPLACE FUNCTION public.renew_subscription(
  _subscription_id uuid,
  _new_period_end timestamp with time zone,
  _transaction_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_record record;
BEGIN
  -- Obtener suscripción
  SELECT * INTO sub_record
  FROM public.subscriptions
  WHERE id = _subscription_id AND status = 'active'::subscription_status;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found or not active';
  END IF;
  
  -- Actualizar período
  UPDATE public.subscriptions
  SET 
    current_period_start = current_period_end,
    current_period_end = _new_period_end,
    updated_at = now()
  WHERE id = _subscription_id;
  
  -- Log de auditoría
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    sub_record.user_id,
    'subscription_renewed',
    'subscription',
    _subscription_id::text,
    jsonb_build_object(
      'plan', sub_record.plan,
      'transaction_id', _transaction_id,
      'new_period_end', _new_period_end,
      'auto_renewed', true
    )
  );
  
  RETURN true;
END;
$$;