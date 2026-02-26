-- Supabase Schema for Boardswallah
-- Run this first to create tables

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Class 10', 'Class 12', 'General')),
  subject TEXT NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author TEXT DEFAULT 'Boardswallah Team',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('Question Paper', 'Answer Key', 'Analysis', 'News', 'Important Questions', 'Study Material', 'Syllabus')),
  pdf_url TEXT,
  pdf_size TEXT,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Schedules table
CREATE TABLE IF NOT EXISTS exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class TEXT NOT NULL CHECK (class IN ('10', '12')),
  exam_date DATE NOT NULL,
  subject TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '10:30 AM - 1:30 PM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#666666',
  font_family TEXT DEFAULT 'sans-serif',
  site_title TEXT DEFAULT 'Boardswallah',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
DROP POLICY IF EXISTS "Allow public read articles" ON articles;
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read settings" ON site_settings;
CREATE POLICY "Allow public read settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read schedules" ON exam_schedules;
CREATE POLICY "Allow public read schedules" ON exam_schedules FOR SELECT USING (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON site_settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
