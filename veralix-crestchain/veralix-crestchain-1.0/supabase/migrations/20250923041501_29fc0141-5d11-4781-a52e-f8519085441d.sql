-- Add RLS policies for transfers table
CREATE POLICY "Users can view transfers involving them"
ON public.certificate_transfers
FOR SELECT
USING (
    (SELECT auth.uid()) = from_user_id::text OR 
    (SELECT auth.uid()) = to_user_id::text
);

CREATE POLICY "Certificate owners can create transfers"
ON public.certificate_transfers
FOR INSERT
WITH CHECK (
    (SELECT auth.uid()) = from_user_id::text AND
    EXISTS (
        SELECT 1 FROM public.nft_certificates 
        WHERE id = certificate_id 
        AND user_id::text = (SELECT auth.uid())
        AND owner_id::text = (SELECT auth.uid())
    )
);