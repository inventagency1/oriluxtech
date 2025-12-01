-- Create table for Wompi webhook logs
CREATE TABLE IF NOT EXISTS public.wompi_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  transaction_id text,
  status text,
  reference text,
  amount_in_cents bigint,
  currency text,
  raw_payload jsonb NOT NULL,
  signature_valid boolean,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  user_id uuid,
  order_id text
);

-- Add index for efficient queries
CREATE INDEX idx_wompi_webhook_logs_transaction_id ON public.wompi_webhook_logs(transaction_id);
CREATE INDEX idx_wompi_webhook_logs_created_at ON public.wompi_webhook_logs(created_at DESC);
CREATE INDEX idx_wompi_webhook_logs_processed ON public.wompi_webhook_logs(processed);
CREATE INDEX idx_wompi_webhook_logs_user_id ON public.wompi_webhook_logs(user_id);

-- Enable RLS
ALTER TABLE public.wompi_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all webhook logs
CREATE POLICY "Admins can view all webhook logs"
  ON public.wompi_webhook_logs
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert webhook logs
CREATE POLICY "System can insert webhook logs"
  ON public.wompi_webhook_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update webhook logs
CREATE POLICY "System can update webhook logs"
  ON public.wompi_webhook_logs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE public.wompi_webhook_logs IS 'Logs all webhooks received from Wompi for debugging and monitoring';