-- Actualizar el rol del usuario Sebastian Martinez de 'cliente' a 'joyero'
-- para que pueda ver y gestionar sus joyas
UPDATE public.user_roles 
SET role = 'joyero' 
WHERE user_id = '437ec4f6-d647-417f-8edc-35ff4bc1bf3f' 
AND role = 'cliente';