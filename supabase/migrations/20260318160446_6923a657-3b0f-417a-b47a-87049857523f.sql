
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  complaint_id UUID REFERENCES public.complaints(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can insert notifications (for assignment triggers)
CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add SMS columns to complaints
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP WITH TIME ZONE;
