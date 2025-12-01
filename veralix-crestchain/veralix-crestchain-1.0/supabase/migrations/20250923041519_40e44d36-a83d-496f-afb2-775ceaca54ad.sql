-- Create simple RLS policies for transfers table
CREATE POLICY "Users can view their transfers"
ON public.certificate_transfers
FOR SELECT
TO authenticated
USING (true); -- Temporary broad access, will refine later

-- Create basic policy for inserts
CREATE POLICY "Authenticated users can create transfers"
ON public.certificate_transfers
FOR INSERT
TO authenticated
WITH CHECK (true); -- Temporary broad access, will refine later