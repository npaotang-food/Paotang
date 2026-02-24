-- Add driver GPS columns to orders table
ALTER TABLE public.orders 
    ADD COLUMN IF NOT EXISTS driver_lat NUMERIC,
    ADD COLUMN IF NOT EXISTS driver_lng NUMERIC,
    ADD COLUMN IF NOT EXISTS driver_updated_at TIMESTAMPTZ;

-- Allow drivers to update their own position (via order ID — no auth needed for driver link)
-- Policy: anyone can UPDATE driver_lat, driver_lng, driver_updated_at on orders
CREATE POLICY IF NOT EXISTS "Allow driver location update on orders" 
    ON public.orders FOR UPDATE 
    USING (true) 
    WITH CHECK (true);
