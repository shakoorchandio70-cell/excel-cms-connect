
-- =============================================
-- FIX 1: Profiles PII Exposure
-- Replace broad SELECT with own-profile + admin only
-- Create a public view for non-PII columns
-- =============================================

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can see their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create a SECURITY DEFINER function to expose non-PII profile data
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  trade text,
  location text,
  is_assignable boolean,
  is_excluded boolean,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, full_name, trade, location, is_assignable, is_excluded, avatar_url
  FROM public.profiles;
$$;

-- =============================================
-- FIX 2: User Roles Privilege Escalation
-- Block all direct INSERT and DELETE
-- =============================================

CREATE POLICY "No direct inserts on user_roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct deletes on user_roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- =============================================
-- FIX 3: Feedback Data Exposure
-- Restrict to submitter, complaint parties, or admin
-- =============================================

DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.feedback;

CREATE POLICY "Users can view relevant feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (
  auth.uid() = submitted_by
  OR EXISTS (
    SELECT 1 FROM public.complaints c
    WHERE c.id = complaint_id
    AND (c.created_by = auth.uid() OR c.assigned_to = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);
