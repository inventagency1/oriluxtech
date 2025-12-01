-- Add owner tracking to certificates
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.nft_certificates ADD COLUMN IF NOT EXISTS transfer_notes TEXT;

-- Update existing certificates to have owner_id = user_id (creator owns initially)
UPDATE public.nft_certificates SET owner_id = user_id WHERE owner_id IS NULL;

-- Make owner_id not null after setting initial values
ALTER TABLE public.nft_certificates ALTER COLUMN owner_id SET NOT NULL;

-- Create transfers history table
CREATE TABLE public.certificate_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID REFERENCES public.nft_certificates(id) ON DELETE CASCADE NOT NULL,
    from_user_id UUID REFERENCES auth.users(id) NOT NULL,
    to_user_id UUID REFERENCES auth.users(id) NOT NULL,
    transfer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transfers
ALTER TABLE public.certificate_transfers ENABLE ROW LEVEL SECURITY;

-- RLS policies for transfers
CREATE POLICY "Users can view transfers involving them"
ON public.certificate_transfers
FOR SELECT
USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
);

CREATE POLICY "Certificate creators can create transfers"
ON public.certificate_transfers
FOR INSERT
WITH CHECK (
    auth.uid() = from_user_id AND
    EXISTS (
        SELECT 1 FROM public.nft_certificates 
        WHERE id = certificate_id 
        AND user_id = auth.uid()
        AND owner_id = auth.uid()
    )
);

-- Update certificate RLS policies to consider ownership
DROP POLICY IF EXISTS "Users can view certificates they own" ON public.nft_certificates;
DROP POLICY IF EXISTS "Users can view their own certificates" ON public.nft_certificates;

-- New policies considering creator vs owner
CREATE POLICY "Certificate creators can view their created certificates"
ON public.nft_certificates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Certificate owners can view their owned certificates"
ON public.nft_certificates
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Certificate owners can update certificates they own"
ON public.nft_certificates
FOR UPDATE
USING (auth.uid() = owner_id);

-- Create function to handle certificate transfers
CREATE OR REPLACE FUNCTION public.transfer_certificate(
    certificate_uuid UUID,
    new_owner_email TEXT,
    transfer_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cert_record RECORD;
    new_owner_record RECORD;
    transfer_record RECORD;
BEGIN
    -- Check if certificate exists and current user is the owner
    SELECT * INTO cert_record
    FROM public.nft_certificates
    WHERE id = certificate_uuid
    AND owner_id = auth.uid();

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Certificate not found or you do not own this certificate'
        );
    END IF;

    -- Find the new owner by email
    SELECT u.id, p.full_name, p.email INTO new_owner_record
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE u.email = new_owner_email;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User with this email not found'
        );
    END IF;

    -- Check if new owner has 'cliente' role
    IF NOT public.has_role(new_owner_record.id, 'cliente') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Target user must be a client (cliente role)'
        );
    END IF;

    -- Cannot transfer to yourself
    IF new_owner_record.id = auth.uid() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot transfer certificate to yourself'
        );
    END IF;

    -- Perform the transfer
    UPDATE public.nft_certificates
    SET 
        owner_id = new_owner_record.id,
        transferred_at = now(),
        transfer_notes = transfer_note
    WHERE id = certificate_uuid;

    -- Record the transfer in history
    INSERT INTO public.certificate_transfers (
        certificate_id,
        from_user_id,
        to_user_id,
        transfer_notes
    ) VALUES (
        certificate_uuid,
        auth.uid(),
        new_owner_record.id,
        transfer_note
    ) RETURNING * INTO transfer_record;

    RETURN jsonb_build_object(
        'success', true,
        'transfer_id', transfer_record.id,
        'new_owner', jsonb_build_object(
            'id', new_owner_record.id,
            'email', new_owner_record.email,
            'name', new_owner_record.full_name
        )
    );
END;
$$;