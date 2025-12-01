-- Agregar enum para estado de transferencia
CREATE TYPE transfer_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');

-- Agregar columna status a certificate_transfers
ALTER TABLE certificate_transfers 
ADD COLUMN status transfer_status DEFAULT 'pending' NOT NULL;

-- Agregar índices para búsquedas eficientes
CREATE INDEX idx_certificate_transfers_status 
ON certificate_transfers(status, to_user_id);

CREATE INDEX idx_certificate_transfers_from_user 
ON certificate_transfers(status, from_user_id);

-- Actualizar RLS policies para incluir validación de estado
DROP POLICY IF EXISTS "Users can create transfers for their certificates only" ON certificate_transfers;

CREATE POLICY "Users can create transfers for their certificates only"
ON certificate_transfers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM nft_certificates nc
    WHERE nc.id = certificate_transfers.certificate_id 
    AND nc.owner_id = auth.uid()
  )
  AND from_user_id = auth.uid()
  AND status = 'pending'
);

-- Policy para actualizar solo el destinatario puede aceptar/rechazar
CREATE POLICY "Recipients can update transfer status"
ON certificate_transfers
FOR UPDATE
TO authenticated
USING (to_user_id = auth.uid() AND status = 'pending')
WITH CHECK (to_user_id = auth.uid() AND status IN ('accepted', 'rejected'));

-- Policy para que remitente pueda cancelar transferencias pendientes
CREATE POLICY "Senders can cancel pending transfers"
ON certificate_transfers
FOR UPDATE
TO authenticated
USING (from_user_id = auth.uid() AND status = 'pending')
WITH CHECK (from_user_id = auth.uid() AND status = 'cancelled');