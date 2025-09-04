-- Create table for password reset tokens
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for password reset tokens (no user access needed - handled by edge functions)
-- No RLS policies needed as this will only be accessed by edge functions with service role

-- Create index for performance
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON public.password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();