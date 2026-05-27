-- Enums
CREATE TYPE public.user_role AS ENUM ('student', 'admin');

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'student',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date DATE,
  event_time TIME,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results Table
CREATE TABLE public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  position TEXT,
  performance TEXT,
  is_best BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rankings Table
CREATE TABLE public.rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_name TEXT NOT NULL,
  event_name TEXT NOT NULL,
  gold_medals INT DEFAULT 0,
  silver_medals INT DEFAULT 0,
  bronze_medals INT DEFAULT 0,
  total_points INT DEFAULT 0,
  ranking_position INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage Content Table
CREATE TABLE public.homepage_content (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT,
  subtitle TEXT,
  announcement TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default homepage content
INSERT INTO public.homepage_content (title, subtitle, announcement)
VALUES ('ACIK Athletics', 'Welcome to the platform', 'Platform is live!');

-- Create trigger for new users to get profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Unknown'), 
    new.email, 
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

-- Create Admin role check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Events are viewable by everyone." 
  ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events." 
  ON public.events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update events." 
  ON public.events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete events." 
  ON public.events FOR DELETE USING (public.is_admin());

-- Results Policies
CREATE POLICY "Results are viewable by everyone." 
  ON public.results FOR SELECT USING (true);
CREATE POLICY "Admins can insert results." 
  ON public.results FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update results." 
  ON public.results FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete results." 
  ON public.results FOR DELETE USING (public.is_admin());

-- Announcements Policies
CREATE POLICY "Announcements are viewable by everyone." 
  ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins can insert announcements." 
  ON public.announcements FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update announcements." 
  ON public.announcements FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete announcements." 
  ON public.announcements FOR DELETE USING (public.is_admin());

-- Rankings Policies
CREATE POLICY "Rankings are viewable by everyone." 
  ON public.rankings FOR SELECT USING (true);
CREATE POLICY "Admins can insert rankings." 
  ON public.rankings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update rankings." 
  ON public.rankings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete rankings." 
  ON public.rankings FOR DELETE USING (public.is_admin());

-- Homepage Policies
CREATE POLICY "Homepage is viewable by everyone." 
  ON public.homepage_content FOR SELECT USING (true);
CREATE POLICY "Admins can update homepage." 
  ON public.homepage_content FOR UPDATE USING (public.is_admin());

-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Uploads are viewable by everyone."
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'uploads' );

CREATE POLICY "Admins can upload files."
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'uploads' AND public.is_admin() );

CREATE POLICY "Admins can update files."
  ON storage.objects FOR UPDATE 
  USING ( bucket_id = 'uploads' AND public.is_admin() );

CREATE POLICY "Admins can delete files."
  ON storage.objects FOR DELETE 
  USING ( bucket_id = 'uploads' AND public.is_admin() );
