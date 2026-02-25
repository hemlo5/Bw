-- Supabase Seed Data for Boardswallah
-- Run this in Supabase SQL Editor to populate your database

-- Enable RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (public read, admin write)
CREATE POLICY "Public can read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);

-- Insert sample articles for Class 10
INSERT INTO articles (id, slug, title, category, subject, publish_date, author, excerpt, content, tags, type, pdf_url, pdf_size, featured, views) VALUES
(
  gen_random_uuid(),
  'cbse-class-10-science-question-paper-2026-set-31-1',
  'CBSE Class 10 Science Question Paper 2026 (Set 31/1/1) PDF Download',
  'Class 10',
  'Science',
  NOW(),
  'Boardswallah Team',
  'Download the official CBSE Class 10 Science Question Paper 2026 (Set 31/1/1). Complete paper with all sections.',
  '<div class="space-y-6">
    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <p class="font-bold text-yellow-800">Disclaimer</p>
      <p class="text-sm text-yellow-700">This paper was uploaded AFTER the exam concluded. We are not affiliated with CBSE.</p>
    </div>
    <h2 class="text-2xl font-bold mt-6 mb-4">Exam Overview</h2>
    <table class="w-full border-collapse border border-gray-300 mb-6">
      <tbody>
        <tr class="bg-gray-100"><td class="p-2 border"><strong>Board</strong></td><td class="p-2 border">CBSE</td></tr>
        <tr><td class="p-2 border"><strong>Subject</strong></td><td class="p-2 border">Science (086)</td></tr>
        <tr class="bg-gray-100"><td class="p-2 border"><strong>Date</strong></td><td class="p-2 border">March 15, 2026</td></tr>
        <tr><td class="p-2 border"><strong>Set Code</strong></td><td class="p-2 border">31/1/1</td></tr>
      </tbody>
    </table>
    <h2 class="text-2xl font-bold mt-6 mb-4">Download PDF</h2>
    <div class="bg-gray-50 p-6 rounded-lg text-center border border-gray-200">
      <button class="bg-black text-white px-6 py-3 rounded-lg font-bold">Download PDF</button>
    </div>
  </div>',
  ARRAY['CBSE', 'Class 10', 'Science', 'Question Paper', '2026'],
  'Question Paper',
  'https://example.com/science-2026.pdf',
  '3.2 MB',
  true,
  3500
),
(
  gen_random_uuid(),
  'cbse-class-10-maths-answer-key-2026',
  'CBSE Class 10 Maths Answer Key 2026 - All Sets Solved',
  'Class 10',
  'Maths',
  NOW() - INTERVAL '1 hour',
  'Expert Team',
  'Unofficial answer key for CBSE Class 10 Maths 2026. MCQ solutions for all sets.',
  '<div class="space-y-6">
    <h2>MCQ Answer Key</h2>
    <table class="w-full border-collapse">
      <thead class="bg-black text-white">
        <tr><th>Q.No</th><th>Answer</th></tr>
      </thead>
      <tbody>
        <tr><td>1</td><td>(b)</td></tr>
        <tr><td>2</td><td>(c)</td></tr>
      </tbody>
    </table>
  </div>',
  ARRAY['CBSE', 'Class 10', 'Maths', 'Answer Key'],
  'Answer Key',
  NULL,
  NULL,
  true,
  5200
),
(
  gen_random_uuid(),
  'cbse-class-10-english-important-questions-2026',
  'CBSE Class 10 English Important Questions 2026 - Literature & Grammar',
  'Class 10',
  'English',
  NOW() - INTERVAL '2 hours',
  'Boardswallah Team',
  'Most important questions for Class 10 English Board Exam 2026. Literature extracts and grammar sections.',
  '<p>Important questions content...</p>',
  ARRAY['CBSE', 'Class 10', 'English', 'Important Questions'],
  'Important Questions',
  NULL,
  NULL,
  false,
  1800
),
(
  gen_random_uuid(),
  'cbse-class-10-social-science-notes',
  'CBSE Class 10 Social Science Quick Revision Notes PDF',
  'Class 10',
  'Social Science',
  NOW() - INTERVAL '3 hours',
  'Boardswallah Team',
  'Complete revision notes for History, Geography, Political Science and Economics.',
  '<p>Study material content...</p>',
  ARRAY['CBSE', 'Class 10', 'Social Science', 'Study Material'],
  'Study Material',
  'https://example.com/sst-notes.pdf',
  '5.1 MB',
  false,
  2100
);

-- Insert sample articles for Class 12
INSERT INTO articles (id, slug, title, category, subject, publish_date, author, excerpt, content, tags, type, pdf_url, pdf_size, featured, views) VALUES
(
  gen_random_uuid(),
  'cbse-class-12-physics-question-paper-2026',
  'CBSE Class 12 Physics Question Paper 2026 (Set 55/1/1)',
  'Class 12',
  'Physics',
  NOW(),
  'Boardswallah Team',
  'Download CBSE Class 12 Physics Question Paper 2026. Complete solved paper with diagrams.',
  '<div class="space-y-6">
    <h2>Exam Details</h2>
    <p>Physics paper was conducted on March 10, 2026. Students found the paper moderately difficult.</p>
    <button class="bg-black text-white px-6 py-3 rounded-lg">Download PDF</button>
  </div>',
  ARRAY['CBSE', 'Class 12', 'Physics', 'Question Paper', '2026'],
  'Question Paper',
  'https://example.com/physics-2026.pdf',
  '4.5 MB',
  true,
  4800
),
(
  gen_random_uuid(),
  'cbse-class-12-chemistry-answer-key-2026',
  'CBSE Class 12 Chemistry Answer Key 2026 - Unofficial Solutions',
  'Class 12',
  'Chemistry',
  NOW() - INTERVAL '30 minutes',
  'Expert Team',
  'Chemistry answer key with organic and inorganic chemistry solutions.',
  '<p>Answer key content...</p>',
  ARRAY['CBSE', 'Class 12', 'Chemistry', 'Answer Key'],
  'Answer Key',
  NULL,
  NULL,
  true,
  6200
),
(
  gen_random_uuid(),
  'cbse-class-12-accountancy-important-questions',
  'CBSE Class 12 Accountancy Most Important Questions 2026',
  'Class 12',
  'Accountancy',
  NOW() - INTERVAL '1 hour',
  'Boardswallah Team',
  'Important questions for Partnership, Company Accounts and Cash Flow Statement chapters.',
  '<p>Important questions with solutions...</p>',
  ARRAY['CBSE', 'Class 12', 'Accountancy', 'Important Questions'],
  'Important Questions',
  NULL,
  NULL,
  false,
  3200
),
(
  gen_random_uuid(),
  'cbse-class-12-maths-study-material',
  'CBSE Class 12 Maths Formula Book & Quick Revision PDF',
  'Class 12',
  'Maths',
  NOW() - INTERVAL '2 hours',
  'Boardswallah Team',
  'Complete formula sheet for Calculus, Algebra, Vectors and 3D Geometry.',
  '<p>Formula book content...</p>',
  ARRAY['CBSE', 'Class 12', 'Maths', 'Study Material'],
  'Study Material',
  'https://example.com/maths-formulas.pdf',
  '2.8 MB',
  false,
  2800
),
(
  gen_random_uuid(),
  'cbse-class-12-biology-paper-analysis',
  'CBSE Class 12 Biology Paper Analysis 2026 - Difficulty & Review',
  'Class 12',
  'Biology',
  NOW() - INTERVAL '4 hours',
  'Expert Team',
  'Complete analysis of Biology paper with section-wise difficulty breakdown.',
  '<p>Analysis content...</p>',
  ARRAY['CBSE', 'Class 12', 'Biology', 'Analysis'],
  'Analysis',
  NULL,
  NULL,
  false,
  1900
),
(
  gen_random_uuid(),
  'cbse-class-12-syllabus-2026',
  'CBSE Class 12 Syllabus 2026 - All Subjects PDF Download',
  'Class 12',
  'General',
  NOW() - INTERVAL '1 day',
  'Boardswallah Team',
  'Complete CBSE Class 12 syllabus for 2026 board exams with marking scheme.',
  '<p>Syllabus details...</p>',
  ARRAY['CBSE', 'Class 12', 'Syllabus', '2026'],
  'Syllabus',
  'https://example.com/syllabus-2026.pdf',
  '1.5 MB',
  true,
  8500
);

-- Insert default site settings
INSERT INTO site_settings (id, primary_color, secondary_color, font_family, site_title, updated_at)
VALUES (1, '#000000', '#666666', 'sans-serif', 'Boardswallah', NOW())
ON CONFLICT (id) DO NOTHING;
