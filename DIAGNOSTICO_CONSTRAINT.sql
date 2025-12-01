-- 1. Ver la definición exacta del constraint problemático
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'nft_certificates_orilux_blockchain_status_check';

-- 2. Ver TODOS los constraints de tipo CHECK en la tabla nft_certificates
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'nft_certificates'::regclass
AND contype = 'c'
ORDER BY conname;

-- 3. Ver la definición de la columna orilux_blockchain_status
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'nft_certificates'
AND column_name = 'orilux_blockchain_status';
