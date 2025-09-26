-- Update announcements table to match expected schema
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update announcements table to use consistent column names
UPDATE public.announcements SET 
  title = COALESCE(title, 'Announcement'),
  content = COALESCE(content, message),
  category = COALESCE(category, 'general'),
  is_active = COALESCE(is_active, true)
WHERE title IS NULL OR content IS NULL;

-- Make title and content non-nullable
ALTER TABLE public.announcements 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN content SET NOT NULL;

-- Update gallery table to match expected schema  
ALTER TABLE public.gallery
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS event_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update gallery records
UPDATE public.gallery SET
  title = COALESCE(title, 'Gallery Image'),
  description = COALESCE(description, caption),
  event_name = COALESCE(event_name, 'Rendezvous 2024'),
  category = COALESCE(category, 'general'),
  tags = COALESCE(tags, ARRAY[]::TEXT[])
WHERE title IS NULL OR description IS NULL;

-- Make title non-nullable
ALTER TABLE public.gallery
ALTER COLUMN title SET NOT NULL;

-- Update results table for proper photo handling
ALTER TABLE public.results
ADD COLUMN IF NOT EXISTS photos JSON DEFAULT '[]'::json,
ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- Create documents storage bucket policies
INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('documents', '.emptyFolderPlaceholder', null) ON CONFLICT DO NOTHING;