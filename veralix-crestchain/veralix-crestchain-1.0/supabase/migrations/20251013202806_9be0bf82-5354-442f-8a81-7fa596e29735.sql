-- Add columns for storing image URLs in jewelry_items table
ALTER TABLE jewelry_items 
ADD COLUMN IF NOT EXISTS main_image_url text,
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Create index to improve performance when querying by main image
CREATE INDEX IF NOT EXISTS idx_jewelry_items_main_image 
ON jewelry_items(main_image_url) 
WHERE main_image_url IS NOT NULL;

-- Add helpful comment
COMMENT ON COLUMN jewelry_items.main_image_url IS 'URL of the main/primary product image';
COMMENT ON COLUMN jewelry_items.image_urls IS 'Array of all product image URLs';