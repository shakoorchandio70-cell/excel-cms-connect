
-- Drop the overly permissive duplicate update policy on inventory
DROP POLICY IF EXISTS "Technicians can update inventory stock" ON public.inventory;

-- Tighten stock_log insert to authenticated users only (logged action)
DROP POLICY IF EXISTS "Authenticated users can insert stock_log" ON public.stock_log;
CREATE POLICY "Authenticated users can insert stock_log" ON public.stock_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Tighten stock_alerts insert
DROP POLICY IF EXISTS "Authenticated can insert stock_alerts" ON public.stock_alerts;
CREATE POLICY "Authenticated can insert stock_alerts" ON public.stock_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Allow any authenticated user to update inventory (needed for technician stock deduction)
CREATE POLICY "Authenticated can update inventory" ON public.inventory
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
