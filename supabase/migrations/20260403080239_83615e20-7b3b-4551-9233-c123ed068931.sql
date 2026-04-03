
-- 1. Create SECURITY DEFINER function for inserting notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _title text,
  _body text,
  _type text,
  _complaint_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type, complaint_id)
  VALUES (_user_id, _title, _body, _type, _complaint_id)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- 2. Replace broad notifications INSERT policy with deny-all (inserts go through RPC only)
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "No direct inserts on notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (false);

-- 3. Restrict complaints SELECT to creator, assigned technician, or admin
DROP POLICY IF EXISTS "Authenticated users can view all complaints" ON public.complaints;
CREATE POLICY "Users can view relevant complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
  OR auth.uid() = assigned_to
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. Restrict user_roles SELECT to own rows only
DROP POLICY IF EXISTS "Authenticated users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
