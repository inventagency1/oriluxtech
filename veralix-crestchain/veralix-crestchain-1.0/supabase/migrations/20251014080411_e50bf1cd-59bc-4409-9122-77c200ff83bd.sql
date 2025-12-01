-- Habilitar extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Programar tarea diaria de renovación de suscripciones (cada día a las 00:00 UTC)
SELECT cron.schedule(
  'renew-subscriptions-daily',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/renew-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a2VncG1qbnBhdXB2d3B0eHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODg0NTcsImV4cCI6MjA3NDE2NDQ1N30.03owv6KPvwyB9UWRzAqoyvyjZcfZgK9tfarCEe8VMsk"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Verificar que la tarea se creó correctamente
SELECT * FROM cron.job WHERE jobname = 'renew-subscriptions-daily';
