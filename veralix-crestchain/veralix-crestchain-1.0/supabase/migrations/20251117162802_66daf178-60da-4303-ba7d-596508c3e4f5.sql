-- Add Wompi transaction tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wompi_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS wompi_status TEXT;

-- Create index for faster lookups by Wompi transaction ID
CREATE INDEX IF NOT EXISTS idx_orders_wompi_transaction_id 
ON orders(wompi_transaction_id);

-- Add comment for documentation
COMMENT ON COLUMN orders.wompi_transaction_id IS 'ID de transacción de Wompi para seguimiento de pagos';
COMMENT ON COLUMN orders.wompi_status IS 'Estado del pago en Wompi (APPROVED, DECLINED, PENDING, etc)';