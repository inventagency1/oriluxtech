-- Check the constraint definition for orilux_blockchain_status
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'nft_certificates_orilux_blockchain_status_check';

-- Show all check constraints on nft_certificates table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'nft_certificates'::regclass
AND contype = 'c';
