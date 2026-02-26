import { getArticles } from '@/lib/supabase'

export const revalidate = 3600

export default async function sitemap() {
  const baseUrl = 'https://boardswallah.com'

  // Fetch all articles with lastModified date
  const { data: articles } = await getArticles()

  // Static routes — ordered by importance
  const staticRoutes = [
    { path: '', priority: 1.0, freq: 'hourly' as const },
    { path: 'category/class-10/', priority: 0.9, freq: 'daily' as const },
    { path: 'category/class-12/', priority: 0.9, freq: 'daily' as const },
    { path: 'archive/', priority: 0.7, freq: 'weekly' as const },
    { path: 'about/', priority: 0.4, freq: 'monthly' as const },
    { path: 'contact/', priority: 0.3, freq: 'monthly' as const },
    { path: 'privacy/', priority: 0.2, freq: 'monthly' as const },
    // ⚠️ admin/ intentionally excluded — must never be indexed
  ]

  const staticEntries = staticRoutes.map(({ path, priority, freq }) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: freq,
    priority,
  }))

  // Article entries — use real publish_date as lastModified
  const articleEntries = articles?.map((article) => ({
    url: `${baseUrl}/article/${article.slug}/`,
    lastModified: new Date(article.updated_at || article.publish_date).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: article.featured ? 0.95 : 0.85,
  })) || []

  return [...staticEntries, ...articleEntries]
}
