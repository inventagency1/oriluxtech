-- Make megastoresco@gmail.com an admin
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id = '437ec4f6-d647-417f-8edc-35ff4bc1bf3f';