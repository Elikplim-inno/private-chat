-- Add phone number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT UNIQUE;

-- Create contacts table to store user contacts
CREATE TABLE public.user_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_phone)
);

-- Enable RLS on user_contacts
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for user_contacts
CREATE POLICY "Users can view their own contacts" 
ON public.user_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.user_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.user_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.user_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to get matched users based on contacts
CREATE OR REPLACE FUNCTION public.get_contact_matched_users(requesting_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  contact_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.phone_number,
    uc.contact_name
  FROM profiles p
  INNER JOIN user_contacts uc ON p.phone_number = uc.contact_phone
  WHERE uc.user_id = requesting_user_id
    AND p.user_id != requesting_user_id
    AND p.phone_number IS NOT NULL;
END;
$$;