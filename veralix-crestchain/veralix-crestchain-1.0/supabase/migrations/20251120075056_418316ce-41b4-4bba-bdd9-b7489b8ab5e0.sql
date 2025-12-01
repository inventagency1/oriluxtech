-- Add soft delete support to marketplace_listings
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);

-- Create index for filtering active listings efficiently
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_deleted_at ON marketplace_listings(deleted_at) WHERE deleted_at IS NULL;

-- Update RLS policies to exclude deleted listings from public view
DROP POLICY IF EXISTS "Anyone can view active listings" ON marketplace_listings;

CREATE POLICY "Anyone can view active listings"
ON marketplace_listings
FOR SELECT
TO authenticated
USING (status = 'active' AND deleted_at IS NULL);

-- Allow sellers to soft delete their own listings
CREATE POLICY "Sellers can soft delete their own listings"
ON marketplace_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = seller_id);

-- Allow admins to view and restore deleted listings
CREATE POLICY "Admins can view all listings including deleted"
ON marketplace_listings
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'joyero'::app_role)
);

-- Create audit log function for product deletion
CREATE OR REPLACE FUNCTION log_marketplace_listing_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details
    ) VALUES (
      NEW.deleted_by,
      'marketplace_listing_deleted',
      'marketplace_listing',
      NEW.id::text,
      jsonb_build_object(
        'listing_id', NEW.id,
        'jewelry_item_id', NEW.jewelry_item_id,
        'seller_id', NEW.seller_id,
        'price', NEW.price,
        'deleted_at', NEW.deleted_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for deletion logging
DROP TRIGGER IF EXISTS trigger_log_marketplace_listing_deletion ON marketplace_listings;

CREATE TRIGGER trigger_log_marketplace_listing_deletion
AFTER UPDATE ON marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION log_marketplace_listing_deletion();