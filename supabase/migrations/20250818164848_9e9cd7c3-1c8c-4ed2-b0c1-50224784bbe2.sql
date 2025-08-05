-- Add country_of_origin column to pens table
ALTER TABLE public.pens 
ADD COLUMN country_of_origin TEXT;