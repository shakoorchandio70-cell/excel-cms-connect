-- Fix 1: Block UPDATE on user_roles to prevent privilege escalation
CREATE POLICY "No direct updates on user_roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false);

-- Fix 2: Restrict stock_log reads to relevant users
DROP POLICY IF EXISTS "Authenticated users can view stock_log" ON public.stock_log;
CREATE POLICY "Scoped stock_log read" ON public.stock_log
FOR SELECT TO authenticated
USING (
  has_role('admin'::app_role) OR
  used_by = auth.uid() OR
  EXISTS (SELECT 1 FROM complaints c WHERE c.id = stock_log.complaint_id
    AND (c.assigned_to = auth.uid() OR c.created_by = auth.uid()))
);

-- Fix 3: Restrict stock_alerts reads to admins only
DROP POLICY IF EXISTS "Authenticated users can view stock_alerts" ON public.stock_alerts;
CREATE POLICY "Admin stock_alerts read" ON public.stock_alerts
FOR SELECT TO authenticated
USING (has_role('admin'::app_role));