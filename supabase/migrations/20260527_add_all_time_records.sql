-- Create All Time Records Table
CREATE TABLE public.all_time_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  batch TEXT,
  place TEXT,
  date TEXT,
  tournament TEXT,
  event TEXT NOT NULL,
  record TEXT,
  iism_record TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_roll_event UNIQUE (roll_number, event)
);

-- Enable RLS
ALTER TABLE public.all_time_records ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "All time records are viewable by everyone." 
  ON public.all_time_records FOR SELECT USING (true);
CREATE POLICY "Admins can insert all time records." 
  ON public.all_time_records FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update all time records." 
  ON public.all_time_records FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all time records." 
  ON public.all_time_records FOR DELETE USING (public.is_admin());
