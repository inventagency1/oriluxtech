-- Actualizar precios base para que oscilen entre 90,000 y 120,000 COP
-- Estructura de precios por tipo de joya:
-- Dije/Aretes (piezas pequeñas): 90,000 COP
-- Anillo/Pulsera/Broche (piezas medianas): 100,000 COP
-- Collar/Cadena (piezas grandes): 110,000 COP
-- Reloj (pieza premium): 120,000 COP

UPDATE certificate_pricing
SET base_price = CASE jewelry_type
  WHEN 'aretes'::jewelry_type_pricing THEN 90000
  WHEN 'dije'::jewelry_type_pricing THEN 90000
  WHEN 'anillo'::jewelry_type_pricing THEN 100000
  WHEN 'pulsera'::jewelry_type_pricing THEN 100000
  WHEN 'broche'::jewelry_type_pricing THEN 100000
  WHEN 'collar'::jewelry_type_pricing THEN 110000
  WHEN 'cadena'::jewelry_type_pricing THEN 110000
  WHEN 'reloj'::jewelry_type_pricing THEN 120000
  ELSE base_price
END,
updated_at = now()
WHERE is_active = true;