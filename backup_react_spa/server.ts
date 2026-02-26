import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Database
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(path.join(dbDir, 'database.sqlite'));

// Setup tables
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT,
    category TEXT,
    subject TEXT,
    publishDate TEXT,
    author TEXT,
    excerpt TEXT,
    type TEXT,
    tags TEXT,
    content TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
if (count.count === 0) {
  const insertArticle = db.prepare(`
    INSERT INTO articles (id, slug, title, category, subject, publishDate, author, excerpt, type, tags, content)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const mockArticles = [
    {
      id: '1',
      slug: 'cbse-class-12-accountancy-question-paper-2026-set-67-5-1',
      title: 'CBSE Class 12 Accountancy Question Paper 2026 (Set 67/5/1) PDF Download',
      category: 'Class 12',
      subject: 'Accountancy',
      publishDate: '2026-03-23T14:30:00',
      author: 'Boardswallah Team',
      excerpt: 'Download the official CBSE Class 12 Accountancy Question Paper 2026 (Set 67/5/1). Review the difficulty level and question pattern.',
      type: 'Question Paper',
      tags: JSON.stringify(['CBSE', 'Class 12', 'Accountancy', 'Question Paper', '2026']),
      content: '<p>The CBSE Class 12 Accountancy exam for 2026 has concluded. Students can now download the Set 1 (Code 67/5/1) question paper PDF below.</p>'
    },
    {
      id: '2',
      slug: 'cbse-class-12-accountancy-answer-key-2026',
      title: 'CBSE Class 12 Accountancy Answer Key 2026 (All Sets) - Fast Update',
      category: 'Class 12',
      subject: 'Accountancy',
      publishDate: '2026-03-23T15:00:00',
      author: 'Boardswallah Expert Team',
      excerpt: 'Check the unofficial answer key for CBSE Class 12 Accountancy Exam 2026. Solved MCQs for Set 1, 2, and 3.',
      type: 'Answer Key',
      tags: JSON.stringify(['CBSE', 'Class 12', 'Accountancy', 'Answer Key', 'Solution']),
      content: '<p>The CBSE Class 12 Accountancy exam is over. Our team of teachers has solved the Multiple Choice Questions (MCQs) for Set 67/5/1.</p>'
    },
    {
      id: '3',
      slug: 'cbse-class-10-science-important-questions-2026',
      title: 'CBSE Class 10 Science Important Questions 2026',
      category: 'Class 10',
      subject: 'Science',
      publishDate: '2026-02-20T10:00:00',
      author: 'Boardswallah Team',
      excerpt: 'Top 50 most expected questions for Class 10 Science Board Exam 2026.',
      type: 'Important Questions',
      tags: JSON.stringify(['CBSE', 'Class 10', 'Science', 'Important Questions']),
      content: '<p>Here are the most important questions for the upcoming Science exam...</p>'
    }
  ];

  const insertMany = db.transaction((articles) => {
    for (const article of articles) {
      insertArticle.run(
        article.id, article.slug, article.title, article.category, article.subject,
        article.publishDate, article.author, article.excerpt, article.type, article.tags, article.content
      );
    }
  });
  insertMany(mockArticles);

  // Default settings
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('primaryColor', '#000000');
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('fontFamily', 'Inter');
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('topNotificationText', 'CBSE Class 12 Accountancy Answer Key Updated!');
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run('topNotificationLink', '/article/cbse-class-12-accountancy-answer-key-2026');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'abc123') {
      res.json({ success: true, token: 'fake-jwt-token-for-demo' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  });

  app.get('/api/articles', (req, res) => {
    const articles = db.prepare('SELECT * FROM articles ORDER BY publishDate DESC').all();
    res.json(articles.map((a: any) => ({ ...a, tags: JSON.parse(a.tags) })));
  });

  app.get('/api/articles/:slug', (req, res) => {
    const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);
    if (article) {
      res.json({ ...article, tags: JSON.parse((article as any).tags) });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.post('/api/articles', (req, res) => {
    const { title, slug, category, subject, author, excerpt, type, tags, content } = req.body;
    const id = Date.now().toString();
    const publishDate = new Date().toISOString();
    
    try {
      db.prepare(`
        INSERT INTO articles (id, slug, title, category, subject, publishDate, author, excerpt, type, tags, content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, slug, title, category, subject, publishDate, author, excerpt, type, JSON.stringify(tags), content);
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/articles/:id', (req, res) => {
    const { title, slug, category, subject, author, excerpt, type, tags, content } = req.body;
    try {
      db.prepare(`
        UPDATE articles 
        SET title = ?, slug = ?, category = ?, subject = ?, author = ?, excerpt = ?, type = ?, tags = ?, content = ?
        WHERE id = ?
      `).run(title, slug, category, subject, author, excerpt, type, JSON.stringify(tags), content, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/articles/:id', (req, res) => {
    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const result: Record<string, string> = {};
    settings.forEach((s: any) => { result[s.key] = s.value; });
    res.json(result);
  });

  app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
