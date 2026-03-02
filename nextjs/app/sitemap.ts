import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600

export default async function sitemap() {
  const baseUrl = 'https://boardswallah.com'
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch articles and PYQ subjects in parallel
  const [{ data: articles }, { data: pyqSubjects }] = await Promise.all([
    supabase
      .from('articles')
      .select('slug, publish_date, featured, type')
      .order('publish_date', { ascending: false }),
    supabase
      .from('pyq_papers')
      .select('subject_slug')
      .eq('class', 'Class 10'),
  ])

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes = [
    { path: '', priority: 1.0, freq: 'hourly' },
    { path: 'category/class-10/', priority: 0.95, freq: 'daily' },
    { path: 'category/class-12/', priority: 0.95, freq: 'daily' },
    { path: 'cbse-class-10-previous-year-question-papers/', priority: 0.90, freq: 'weekly' },
    { path: 'category/class-10/question-papers/', priority: 0.8, freq: 'daily' },
    { path: 'category/class-10/answer-keys/', priority: 0.8, freq: 'daily' },
    { path: 'category/class-10/important-questions/', priority: 0.7, freq: 'weekly' },
    { path: 'category/class-10/study-material/', priority: 0.7, freq: 'weekly' },
    { path: 'category/class-10/analysis/', priority: 0.7, freq: 'weekly' },
    { path: 'category/class-12/question-papers/', priority: 0.8, freq: 'daily' },
    { path: 'category/class-12/answer-keys/', priority: 0.8, freq: 'daily' },
    { path: 'category/class-12/important-questions/', priority: 0.7, freq: 'weekly' },
    { path: 'category/class-12/study-material/', priority: 0.7, freq: 'weekly' },
    { path: 'category/class-12/analysis/', priority: 0.7, freq: 'weekly' },
    { path: 'archive/', priority: 0.6, freq: 'weekly' },
    { path: 'about/', priority: 0.4, freq: 'monthly' },
    { path: 'contact/', priority: 0.3, freq: 'monthly' },
    { path: 'privacy/', priority: 0.2, freq: 'monthly' },
    // ⚠️  admin/ and pdf-viewer/ intentionally excluded — must NOT be indexed
  ] as const

  const staticEntries = staticRoutes.map(({ path, priority, freq }) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: freq,
    priority,
  }))

  // ── Article entries ────────────────────────────────────────────────────────
  const articleEntries = (articles || []).map(article => ({
    url: `${baseUrl}/article/${article.slug}/`,
    lastModified: new Date(article.publish_date).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: article.featured ? 0.95 : 0.80,
  }))

  // ── PYQ subject entries (unique subjects only) ─────────────────────────────
  const uniqueSlugs = [...new Set((pyqSubjects || []).map(p => p.subject_slug))]
  const pyqEntries = uniqueSlugs.map(slug => ({
    url: `${baseUrl}/class-10/pyq/`,   // single PYQ page (anchored by subject)
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  })).slice(0, 1) // just include the one PYQ page once

  return [...staticEntries, ...articleEntries, ...pyqEntries]
}
