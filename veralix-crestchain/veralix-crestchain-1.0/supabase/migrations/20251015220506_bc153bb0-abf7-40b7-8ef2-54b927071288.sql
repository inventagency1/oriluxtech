-- FASE 1: Paso 2 (corregido) - Insertar precios para "pendientes" con valores correctos de client_category
INSERT INTO certificate_pricing (jewelry_type, client_category, base_price, currency, discount_percentage, is_active, created_at, updated_at)
VALUES 
  ('pendientes', 'regular', 50000, 'COP', 0, true, now(), now()),
  ('pendientes', 'premium', 50000, 'COP', 20, true, now(), now()),
  ('pendientes', 'corporativo', 45000, 'COP', 25, true, now(), now()),
  ('pendientes', 'mayorista', 40000, 'COP', 30, true, now(), now())
ON CONFLICT DO NOTHING;