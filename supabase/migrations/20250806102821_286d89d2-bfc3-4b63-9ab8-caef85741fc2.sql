-- Phase 1: Create secure database schema with proper RLS policies

-- Create pens table
CREATE TABLE public.pens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT NOT NULL,
  nib_size TEXT NOT NULL,
  era TEXT NOT NULL,
  nib_material TEXT NOT NULL,
  color TEXT NOT NULL,
  purchase_date TEXT NOT NULL,
  price TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inks table
CREATE TABLE public.inks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  primary_color TEXT,
  volume TEXT NOT NULL,
  purchase_date TEXT NOT NULL,
  price TEXT NOT NULL,
  notes TEXT DEFAULT '',
  waterproof BOOLEAN NOT NULL DEFAULT false,
  sheen BOOLEAN NOT NULL DEFAULT false,
  shimmer BOOLEAN NOT NULL DEFAULT false,
  shading BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inking_events table
CREATE TABLE public.inking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pen_id UUID NOT NULL REFERENCES public.pens(id) ON DELETE CASCADE,
  ink_id UUID REFERENCES public.inks(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('inked', 'cleaned', 're-inked')),
  date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inking_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pens table
CREATE POLICY "Users can view their own pens" 
ON public.pens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pens" 
ON public.pens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pens" 
ON public.pens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pens" 
ON public.pens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for inks table
CREATE POLICY "Users can view their own inks" 
ON public.inks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inks" 
ON public.inks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inks" 
ON public.inks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inks" 
ON public.inks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for inking_events table
CREATE POLICY "Users can view their own inking events" 
ON public.inking_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inking events" 
ON public.inking_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inking events" 
ON public.inking_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inking events" 
ON public.inking_events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix overly permissive profiles RLS policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pens_updated_at
BEFORE UPDATE ON public.pens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inks_updated_at
BEFORE UPDATE ON public.inks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inking_events_updated_at
BEFORE UPDATE ON public.inking_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();