
-- Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  unit TEXT NOT NULL DEFAULT 'Pcs',
  total_inward NUMERIC NOT NULL DEFAULT 0,
  total_consumed NUMERIC NOT NULL DEFAULT 0,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_level NUMERIC NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view inventory" ON public.inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert inventory" ON public.inventory
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory" ON public.inventory
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow technicians to update inventory (for stock deduction)
CREATE POLICY "Technicians can update inventory stock" ON public.inventory
  FOR UPDATE TO authenticated USING (true);

-- Stock log table
CREATE TABLE IF NOT EXISTS public.stock_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.inventory(id),
  qty NUMERIC NOT NULL,
  direction TEXT NOT NULL,
  complaint_id UUID REFERENCES public.complaints(id),
  used_by UUID,
  supplier TEXT,
  remarks TEXT,
  date_received DATE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock_log" ON public.stock_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert stock_log" ON public.stock_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Stock alerts table
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory(id),
  alert_type TEXT NOT NULL,
  stock_at_alert NUMERIC,
  min_level NUMERIC,
  sms_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock_alerts" ON public.stock_alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert stock_alerts" ON public.stock_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

-- Add mobile and alert time to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS daily_alert_time TIME DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS mobile_updated_at TIMESTAMPTZ;

-- Seed initial inventory items
INSERT INTO public.inventory (item_name, category, unit, min_level, current_stock, total_inward) VALUES
('LED Bulb 11-13W', 'Lighting', 'Pcs', 10, 50, 50),
('LED Bulb 15W', 'Lighting', 'Pcs', 10, 40, 40),
('LED Bulb 18W', 'Lighting', 'Pcs', 10, 30, 30),
('LED Bulb 24W', 'Lighting', 'Pcs', 5, 20, 20),
('CFL 18W', 'Lighting', 'Pcs', 5, 15, 15),
('CFL 23W', 'Lighting', 'Pcs', 5, 15, 15),
('Tubelight 36W', 'Lighting', 'Pcs', 10, 25, 25),
('Tubelight 18W', 'Lighting', 'Pcs', 10, 20, 20),
('Electronic Ballast 36W', 'Lighting', 'Pcs', 5, 12, 12),
('Electronic Ballast 18W', 'Lighting', 'Pcs', 5, 12, 12),
('Magnetic Ballast', 'Lighting', 'Pcs', 3, 8, 8),
('Starter', 'Lighting', 'Pcs', 10, 30, 30),
('Holder B22', 'Lighting', 'Pcs', 10, 25, 25),
('Holder E27', 'Lighting', 'Pcs', 10, 20, 20),
('MCB 6A', 'Electrical', 'Pcs', 5, 15, 15),
('MCB 10A', 'Electrical', 'Pcs', 5, 15, 15),
('MCB 16A', 'Electrical', 'Pcs', 5, 15, 15),
('MCB 20A', 'Electrical', 'Pcs', 5, 10, 10),
('MCB 32A', 'Electrical', 'Pcs', 3, 8, 8),
('MCB 40A', 'Electrical', 'Pcs', 3, 5, 5),
('RCCB 32A', 'Electrical', 'Pcs', 2, 5, 5),
('Switch 1-Way', 'Electrical', 'Pcs', 10, 20, 20),
('Switch 2-Way', 'Electrical', 'Pcs', 5, 15, 15),
('Switch 3-Way', 'Electrical', 'Pcs', 3, 10, 10),
('Switch 4-Way', 'Electrical', 'Pcs', 3, 8, 8),
('Bell Push Switch', 'Electrical', 'Pcs', 3, 10, 10),
('Socket 3-Pin', 'Electrical', 'Pcs', 5, 15, 15),
('Socket 5-Pin', 'Electrical', 'Pcs', 5, 10, 10),
('Universal Socket', 'Electrical', 'Pcs', 5, 12, 12),
('Plug 3-Pin', 'Electrical', 'Pcs', 5, 15, 15),
('Plug 5-Pin', 'Electrical', 'Pcs', 3, 8, 8),
('Plug 15A', 'Electrical', 'Pcs', 3, 8, 8),
('Wire 1.5mm', 'Wiring', 'Meters', 50, 200, 200),
('Wire 2.5mm', 'Wiring', 'Meters', 50, 200, 200),
('Wire 4mm', 'Wiring', 'Meters', 30, 100, 100),
('Wire 6mm', 'Wiring', 'Meters', 20, 80, 80),
('Flexible Wire 1mm', 'Wiring', 'Meters', 30, 100, 100),
('PVC Conduit 20mm', 'Wiring', 'Meters', 20, 50, 50),
('PVC Conduit 25mm', 'Wiring', 'Meters', 10, 30, 30),
('PVC Tape', 'Accessories', 'Rolls', 10, 25, 25),
('Insulation Tape', 'Accessories', 'Rolls', 10, 20, 20),
('Cable Ties (pack)', 'Accessories', 'Pcs', 5, 15, 15),
('Junction Box', 'Accessories', 'Pcs', 5, 10, 10),
('AC Gas R22', 'HVAC', 'Kg', 5, 15, 15),
('AC Gas R410A', 'HVAC', 'Kg', 5, 10, 10),
('Capacitor 2.5µf', 'HVAC', 'Pcs', 5, 12, 12),
('Capacitor 3.5µf', 'HVAC', 'Pcs', 5, 18, 18),
('Capacitor 5µf', 'HVAC', 'Pcs', 3, 8, 8),
('Capacitor 25µf', 'HVAC', 'Pcs', 3, 6, 6),
('Capacitor 35µf', 'HVAC', 'Pcs', 3, 6, 6),
('Fan Motor', 'HVAC', 'Pcs', 2, 5, 5),
('Fan Blade', 'HVAC', 'Pcs', 3, 8, 8),
('Fan Regulator', 'Electrical', 'Pcs', 5, 12, 12),
('Ceiling Fan Complete', 'Electrical', 'Pcs', 2, 5, 5),
('Exhaust Fan 12"', 'Electrical', 'Pcs', 2, 4, 4),
('Door Bell', 'Electrical', 'Pcs', 3, 8, 8),
('Extension Board', 'Accessories', 'Pcs', 3, 6, 6),
('Contactor', 'HVAC', 'Pcs', 2, 4, 4),
('Relay', 'Electrical', 'Pcs', 3, 6, 6),
('Thermostat', 'HVAC', 'Pcs', 2, 4, 4),
('Compressor Oil', 'HVAC', 'Kg', 3, 5, 5),
('Filter Drier', 'HVAC', 'Pcs', 3, 6, 6),
('Copper Tube 1/4"', 'HVAC', 'Meters', 10, 20, 20),
('Copper Tube 3/8"', 'HVAC', 'Meters', 10, 20, 20),
('Brazing Rod', 'HVAC', 'Pcs', 10, 25, 25),
('Condenser Coil', 'HVAC', 'Pcs', 1, 3, 3),
('Evaporator Coil', 'HVAC', 'Pcs', 1, 3, 3),
('Water Cooler Element', 'HVAC', 'Pcs', 1, 2, 2),
('Pipe Wrench 12"', 'Tools', 'Pcs', 1, 2, 2),
('Screwdriver Set', 'Tools', 'Sets', 1, 3, 3),
('Multimeter', 'Tools', 'Pcs', 1, 2, 2),
('Clamp Meter', 'Tools', 'Pcs', 1, 2, 2),
('Soldering Iron', 'Tools', 'Pcs', 1, 2, 2),
('Wire Stripper', 'Tools', 'Pcs', 1, 3, 3),
('Phase Tester', 'Tools', 'Pcs', 2, 4, 4),
('Pressure Gauge', 'HVAC', 'Pcs', 1, 2, 2),
('Vacuum Pump Oil', 'HVAC', 'Kg', 2, 3, 3),
('Gas Charging Pipe', 'HVAC', 'Sets', 1, 2, 2),
('Nut Bolt Assorted', 'Accessories', 'Sets', 3, 8, 8),
('Rawl Plug', 'Accessories', 'Pcs', 20, 50, 50),
('Wood Screw Assorted', 'Accessories', 'Pcs', 20, 50, 50);
