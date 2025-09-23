-- Create tables for RENDEZVOUS festival website

-- Schedule table for events
CREATE TABLE public.schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('competition', 'talk', 'workshop')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Results table for competition results
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.schedule(id),
  participant TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  points INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gallery table for photo uploads
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (students can view everything)
CREATE POLICY "Public can view schedule" ON public.schedule FOR SELECT USING (true);
CREATE POLICY "Public can view results" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);

-- Admin write access (will be updated when auth is implemented)
CREATE POLICY "Admins can manage schedule" ON public.schedule FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage results" ON public.results FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage gallery" ON public.gallery FOR ALL USING (auth.uid() IS NOT NULL);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('results', 'results', true);

-- Storage policies for gallery bucket
CREATE POLICY "Gallery images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.uid() IS NOT NULL);

-- Storage policies for results bucket
CREATE POLICY "Result images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'results');
CREATE POLICY "Admins can upload result images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'results' AND auth.uid() IS NOT NULL);

-- Create leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
  participant,
  SUM(points) as total_points,
  COUNT(*) as event_count,
  RANK() OVER (ORDER BY SUM(points) DESC) as rank
FROM public.results
GROUP BY participant
ORDER BY total_points DESC;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON public.schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();