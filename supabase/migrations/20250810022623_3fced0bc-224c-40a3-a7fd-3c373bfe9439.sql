-- Add filling_mechanism column to pens table
ALTER TABLE public.pens 
ADD COLUMN filling_mechanism TEXT;