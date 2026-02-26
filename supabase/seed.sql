-- Supabase Seed Data for Boardswallah
-- Run this in Supabase SQL Editor AFTER running schema.sql

-- ─── Site Settings ───────────────────────────────────────────────────────────
INSERT INTO site_settings (id, primary_color, secondary_color, font_family, site_title, updated_at)
VALUES (1, '#000000', '#666666', 'sans-serif', 'Boardswallah', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── Articles ─────────────────────────────────────────────────────────────────
INSERT INTO articles (slug, title, category, subject, publish_date, author, excerpt, content, tags, type, pdf_url, pdf_size, featured, views) VALUES
('cbse-class-10-science-question-paper-2026', 'CBSE Class 10 Science Question Paper 2026 PDF Download', 'Class 10', 'Science', NOW(), 'Boardswallah Team', 'Download the official CBSE Class 10 Science Question Paper 2026. Complete paper with all sections.', '<p>Full science question paper content here.</p>', ARRAY['CBSE','Class 10','Science','Question Paper','2026'], 'Question Paper', 'https://example.com/science-2026.pdf', '3.2 MB', true, 3500),
('cbse-class-10-maths-answer-key-2026', 'CBSE Class 10 Maths Answer Key 2026 - All Sets', 'Class 10', 'Maths', NOW() - INTERVAL '1 hour', 'Expert Team', 'Unofficial answer key for CBSE Class 10 Maths 2026. MCQ solutions for all sets.', '<p>Maths answer key content here.</p>', ARRAY['CBSE','Class 10','Maths','Answer Key'], 'Answer Key', NULL, NULL, true, 5200),
('cbse-class-10-english-important-questions-2026', 'CBSE Class 10 English Important Questions 2026', 'Class 10', 'English', NOW() - INTERVAL '2 hours', 'Boardswallah Team', 'Most important questions for Class 10 English Board Exam 2026.', '<p>Important questions content here.</p>', ARRAY['CBSE','Class 10','English','Important Questions'], 'Important Questions', NULL, NULL, false, 1800),
('cbse-class-10-social-science-notes-2026', 'CBSE Class 10 Social Science Quick Revision Notes PDF', 'Class 10', 'Social Science', NOW() - INTERVAL '3 hours', 'Boardswallah Team', 'Complete revision notes for History, Geography, Political Science and Economics.', '<p>Study material content here.</p>', ARRAY['CBSE','Class 10','Social Science','Study Material'], 'Study Material', 'https://example.com/sst-notes.pdf', '5.1 MB', false, 2100),
('cbse-class-12-physics-question-paper-2026', 'CBSE Class 12 Physics Question Paper 2026 (Set 55/1/1)', 'Class 12', 'Physics', NOW(), 'Boardswallah Team', 'Download CBSE Class 12 Physics Question Paper 2026. Complete paper with diagrams.', '<p>Physics paper content here.</p>', ARRAY['CBSE','Class 12','Physics','Question Paper','2026'], 'Question Paper', 'https://example.com/physics-2026.pdf', '4.5 MB', true, 4800),
('cbse-class-12-chemistry-answer-key-2026', 'CBSE Class 12 Chemistry Answer Key 2026 - Unofficial', 'Class 12', 'Chemistry', NOW() - INTERVAL '30 minutes', 'Expert Team', 'Chemistry answer key with organic and inorganic chemistry solutions.', '<p>Answer key content here.</p>', ARRAY['CBSE','Class 12','Chemistry','Answer Key'], 'Answer Key', NULL, NULL, true, 6200),
('cbse-class-12-accountancy-important-questions-2026', 'CBSE Class 12 Accountancy Most Important Questions 2026', 'Class 12', 'Accountancy', NOW() - INTERVAL '1 hour', 'Boardswallah Team', 'Important questions for Partnership, Company Accounts and Cash Flow Statement.', '<p>Important questions here.</p>', ARRAY['CBSE','Class 12','Accountancy','Important Questions'], 'Important Questions', NULL, NULL, false, 3200),
('cbse-class-12-maths-formula-book-2026', 'CBSE Class 12 Maths Formula Book & Quick Revision PDF', 'Class 12', 'Maths', NOW() - INTERVAL '2 hours', 'Boardswallah Team', 'Complete formula sheet for Calculus, Algebra, Vectors and 3D Geometry.', '<p>Formula book content here.</p>', ARRAY['CBSE','Class 12','Maths','Study Material'], 'Study Material', 'https://example.com/maths-formulas.pdf', '2.8 MB', false, 2800),
('cbse-class-12-biology-paper-analysis-2026', 'CBSE Class 12 Biology Paper Analysis 2026 - Difficulty Review', 'Class 12', 'Biology', NOW() - INTERVAL '4 hours', 'Expert Team', 'Complete analysis of Biology paper with section-wise difficulty breakdown.', '<p>Analysis content here.</p>', ARRAY['CBSE','Class 12','Biology','Analysis'], 'Analysis', NULL, NULL, false, 1900),
('cbse-class-12-syllabus-2026', 'CBSE Class 12 Syllabus 2026 - All Subjects PDF Download', 'Class 12', 'General', NOW() - INTERVAL '1 day', 'Boardswallah Team', 'Complete CBSE Class 12 syllabus for 2026 board exams with marking scheme.', '<p>Syllabus details here.</p>', ARRAY['CBSE','Class 12','Syllabus','2026'], 'Syllabus', 'https://example.com/syllabus-2026.pdf', '1.5 MB', true, 8500)
ON CONFLICT (slug) DO NOTHING;

-- ─── Class 10 Exam Schedule ───────────────────────────────────────────────────
INSERT INTO exam_schedules (class, exam_date, subject, time) VALUES
('10', '2026-02-17', 'Mathematics Standard; Mathematics Basic', '10:30 AM - 1:30 PM'),
('10', '2026-02-18', 'Home Science', '10:30 AM - 1:30 PM'),
('10', '2026-02-20', 'Beauty and Wellness; Marketing and Sales; Multi Skill Foundation Course; Data Science', '10:30 AM - 1:30 PM'),
('10', '2026-02-21', 'English (Communicative / Language & Literature)', '10:30 AM - 1:30 PM'),
('10', '2026-02-23', 'Urdu Course A; Punjabi; Bengali; Tamil; Marathi; Gujarati', '10:30 AM - 1:30 PM'),
('10', '2026-02-24', 'Element of Business', '10:30 AM - 1:30 PM'),
('10', '2026-02-25', 'Science', '10:30 AM - 1:30 PM'),
('10', '2026-02-26', 'Security; Automotive; Agriculture; Food Production; Banking & Insurance; Healthcare; Apparel', '10:30 AM - 1:30 PM'),
('10', '2026-02-27', 'Computer Applications; Information Technology; AI', '10:30 AM - 1:30 PM'),
('10', '2026-02-28', 'Arabic; Sanskrit; Rai; Gurung; Tamang; Sherpa', '10:30 AM - 1:30 PM'),
('10', '2026-03-02', 'Hindi (Course A); Hindi (Course B)', '10:30 AM - 1:30 PM'),
('10', '2026-03-05', 'Sindhi; Malayalam; Odia; Kannada', '10:30 AM - 1:30 PM'),
('10', '2026-03-06', 'Painting', '10:30 AM - 1:30 PM'),
('10', '2026-03-07', 'Social Science', '10:30 AM - 1:30 PM'),
('10', '2026-03-09', 'Telugu; Russian; Limboo; Lepcha; Nepali', '10:30 AM - 1:30 PM'),
('10', '2026-03-10', 'French; Tibetan; German; Japanese; Spanish; Kashmiri; Mizo', '10:30 AM - 1:30 PM')
ON CONFLICT DO NOTHING;

-- ─── Class 12 Exam Schedule ───────────────────────────────────────────────────
INSERT INTO exam_schedules (class, exam_date, subject, time) VALUES
('12', '2026-02-17', 'Biotechnology; Entrepreneurship; Shorthand (English); Shorthand (Hindi)', '10:30 AM - 1:30 PM'),
('12', '2026-02-18', 'Physical Education', '10:30 AM - 1:30 PM'),
('12', '2026-02-19', 'Engineering Graphics; Bharatanatyam; Kuchipudi; Odissi; Manipuri; Kathakali; Horticulture; Cost Accounting', '10:30 AM - 1:30 PM'),
('12', '2026-02-20', 'Physics', '10:30 AM - 1:30 PM'),
('12', '2026-02-21', 'Automotive; Fashion Studies', '10:30 AM - 1:30 PM'),
('12', '2026-02-23', 'Mass Media Studies; Design Thinking and Innovation', '10:30 AM - 1:30 PM'),
('12', '2026-02-24', 'Accountancy', '10:30 AM - 1:30 PM'),
('12', '2026-02-25', 'Beauty & Wellness; Typography & Computer Application', '10:30 AM - 1:30 PM'),
('12', '2026-02-26', 'Geography', '10:30 AM - 1:30 PM'),
('12', '2026-02-27', 'Painting; Graphics; Sculpture; Applied Art (Commercial Art)', '10:30 AM - 1:30 PM'),
('12', '2026-02-28', 'Chemistry', '10:30 AM - 1:30 PM'),
('12', '2026-03-02', 'Urdu Elective; Sanskrit Elective; Carnatic Music; Kathak; Urdu Core; Front Office Operations; Insurance', '10:30 AM - 1:30 PM'),
('12', '2026-03-05', 'Psychology', '10:30 AM - 1:30 PM'),
('12', '2026-03-06', 'Punjabi; Bengali; Tamil; Telugu; Sindhi; Marathi; Gujarati; Manipuri; Malayalam; Odia; Kannada; Arabic', '10:30 AM - 1:30 PM'),
('12', '2026-03-07', 'Yoga; Electronics & Hardware', '10:30 AM - 1:30 PM'),
('12', '2026-03-09', 'Mathematics; Applied Mathematics', '10:30 AM - 1:30 PM'),
('12', '2026-03-10', 'Food Production; Office Procedures & Practices; Library & Information Science; Early Childhood Care & Education', '10:30 AM - 1:30 PM'),
('12', '2026-03-11', 'Hindustani Music Mel Ins; Hindustani Music Per Ins; Health Care; Design', '10:30 AM - 1:30 PM'),
('12', '2026-03-12', 'English Elective / English Core', '10:30 AM - 1:30 PM'),
('12', '2026-03-13', 'Tourism; Air-conditioning & Refrigeration', '10:30 AM - 1:30 PM'),
('12', '2026-03-14', 'Home Science', '10:30 AM - 1:30 PM'),
('12', '2026-03-16', 'Hindi Elective / Hindi Core', '10:30 AM - 1:30 PM'),
('12', '2026-03-17', 'Hindustani Music Vocal', '10:30 AM - 1:30 PM'),
('12', '2026-03-18', 'Economics', '10:30 AM - 1:30 PM'),
('12', '2026-03-23', 'Political Science', '10:30 AM - 1:30 PM'),
('12', '2026-03-24', 'Retail; Artificial Intelligence', '10:30 AM - 1:30 PM'),
('12', '2026-03-25', 'Informatics Practices; Computer Science; Information Technology', '10:30 AM - 1:30 PM'),
('12', '2026-03-27', 'Biology', '10:30 AM - 1:30 PM'),
('12', '2026-03-28', 'Business Studies; Business Administration', '10:30 AM - 1:30 PM'),
('12', '2026-03-30', 'History', '10:30 AM - 1:30 PM'),
('12', '2026-04-02', 'National Cadet Corps (NCC); Food Nutrition & Dietetics', '10:30 AM - 1:30 PM'),
('12', '2026-04-04', 'Sociology', '10:30 AM - 1:30 PM'),
('12', '2026-04-08', 'Sanskrit Core; French; Taxation', '10:30 AM - 1:30 PM'),
('12', '2026-04-10', 'Legal Studies', '10:30 AM - 1:30 PM')
ON CONFLICT DO NOTHING;
