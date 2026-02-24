-- Add GPS coordinates to addresses table
ALTER TABLE public.addresses
    ADD COLUMN IF NOT EXISTS lat  NUMERIC,
    ADD COLUMN IF NOT EXISTS lng  NUMERIC;
