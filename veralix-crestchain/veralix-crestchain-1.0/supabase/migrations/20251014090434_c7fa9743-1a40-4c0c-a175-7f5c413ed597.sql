-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on extensions schema to postgres
GRANT USAGE ON SCHEMA extensions TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO postgres;

-- Create cron job to run subscription renewal daily at 2 AM
SELECT cron.schedule(
  'renew-subscriptions-daily',
  '0 2 * * *', -- Runs every day at 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://hykegpmjnpaupvwptxtl.supabase.co/functions/v1/renew-subscriptions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a2VncG1qbnBhdXB2d3B0eHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODg0NTcsImV4cCI6MjA3NDE2NDQ1N30.03owv6KPvwyB9UWRzAqoyvyjZcfZgK9tfarCEe8VMsk"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Log the cron job creation
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  details
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'cron_job_created',
  'system',
  'renew-subscriptions-daily',
  jsonb_build_object(
    'schedule', '0 2 * * *',
    'description', 'Daily subscription renewal job',
    'created_at', now()
  )
);