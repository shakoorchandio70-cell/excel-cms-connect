
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reopened_at timestamptz;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS reopen_count int DEFAULT 0;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS last_updated_by uuid;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS last_updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL,
  rating int,
  comment text,
  reopen_reason text,
  action text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view feedback" ON feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own feedback" ON feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Authenticated users can view all roles" ON user_roles FOR SELECT TO authenticated USING (true);
