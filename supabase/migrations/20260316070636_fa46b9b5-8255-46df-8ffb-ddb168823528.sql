ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trade text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS is_assignable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_excluded boolean DEFAULT false;