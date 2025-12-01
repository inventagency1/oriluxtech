-- Make owner_id not null and create transfers table
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