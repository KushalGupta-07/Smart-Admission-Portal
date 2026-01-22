-- Create a sequence for admit card numbers
CREATE SEQUENCE IF NOT EXISTS admit_card_seq START 1;

-- Create admit_cards table
CREATE TABLE public.admit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  admit_card_number TEXT NOT NULL UNIQUE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate admit card number
CREATE OR REPLACE FUNCTION public.generate_admit_card_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.admit_card_number := 'ADM' || TO_CHAR(NOW(), 'YYYY') || LPAD(NEXTVAL('admit_card_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic admit card number generation
CREATE TRIGGER generate_admit_card_number_trigger
BEFORE INSERT ON public.admit_cards
FOR EACH ROW
EXECUTE FUNCTION public.generate_admit_card_number();

-- Enable RLS
ALTER TABLE public.admit_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own admit cards"
ON public.admit_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admit cards"
ON public.admit_cards
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert admit cards"
ON public.admit_cards
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));