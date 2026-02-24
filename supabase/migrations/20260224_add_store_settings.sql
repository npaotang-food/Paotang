-- Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id SERIAL PRIMARY KEY,
    store_lat NUMERIC NOT NULL DEFAULT 13.776760243398838,
    store_lng NUMERIC NOT NULL DEFAULT 100.66194468243428,
    free_delivery_km NUMERIC NOT NULL DEFAULT 3.0,
    flat_fee_start_km NUMERIC NOT NULL DEFAULT 5.0,
    flat_fee_end_km NUMERIC NOT NULL DEFAULT 10.0,
    flat_fee_amount INTEGER NOT NULL DEFAULT 30,
    base_delivery_fee INTEGER NOT NULL DEFAULT 15,
    per_km_fee INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO public.store_settings (id) 
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM public.store_settings WHERE id = 1);

-- Allow public read access
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin update on store_settings" ON public.store_settings FOR UPDATE USING (public.is_admin());
