
-- 1. Replace has_role with self-check-only version (single arg)
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

-- Keep the two-arg version but restrict it to only allow self-checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN _user_id = auth.uid() THEN
      EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
      )
    ELSE false
  END
$$;

-- 2. Update all RLS policies that use has_role to use single-arg version

-- complaints SELECT
DROP POLICY IF EXISTS "Users can view relevant complaints" ON complaints;
CREATE POLICY "Users can view relevant complaints" ON complaints
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assigned_to OR has_role('admin'::app_role));

-- complaints UPDATE
DROP POLICY IF EXISTS "Users can update assigned or own complaints" ON complaints;
CREATE POLICY "Users can update assigned or own complaints" ON complaints
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assigned_to OR has_role('admin'::app_role));

-- inventory INSERT
DROP POLICY IF EXISTS "Admins can insert inventory" ON inventory;
CREATE POLICY "Admins can insert inventory" ON inventory
  FOR INSERT TO authenticated
  WITH CHECK (has_role('admin'::app_role));

-- inventory UPDATE
DROP POLICY IF EXISTS "Admins can update inventory" ON inventory;
CREATE POLICY "Admins can update inventory" ON inventory
  FOR UPDATE TO authenticated
  USING (has_role('admin'::app_role));

-- profiles SELECT (admin)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (has_role('admin'::app_role));

-- feedback SELECT
DROP POLICY IF EXISTS "Users can view relevant feedback" ON feedback;
CREATE POLICY "Users can view relevant feedback" ON feedback
  FOR SELECT TO authenticated
  USING (
    auth.uid() = submitted_by
    OR EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = feedback.complaint_id
        AND (c.created_by = auth.uid() OR c.assigned_to = auth.uid())
    )
    OR has_role('admin'::app_role)
  );

-- 3. Tighten stock_log INSERT: admins or technicians on linked complaints
DROP POLICY IF EXISTS "Authenticated users can insert stock_log" ON stock_log;
CREATE POLICY "Authorized users can insert stock_log" ON stock_log
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role('admin'::app_role)
    OR (
      complaint_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM complaints c
        WHERE c.id = stock_log.complaint_id
          AND c.assigned_to = auth.uid()
      )
    )
  );

-- 4. Tighten stock_alerts INSERT: deny direct inserts (edge functions use service role)
DROP POLICY IF EXISTS "Authenticated can insert stock_alerts" ON stock_alerts;
CREATE POLICY "No direct inserts on stock_alerts" ON stock_alerts
  FOR INSERT TO authenticated
  WITH CHECK (false);
