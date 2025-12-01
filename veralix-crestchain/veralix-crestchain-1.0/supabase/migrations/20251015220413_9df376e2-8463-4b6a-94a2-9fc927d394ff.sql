-- FASE 1: Paso 1 - Agregar "pendientes" al enum jewelry_type_pricing
ALTER TYPE jewelry_type_pricing ADD VALUE IF NOT EXISTS 'pendientes';