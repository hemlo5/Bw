import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

// ─── Env / client setup ───────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const hasValidCreds =
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('example.supabase.co') &&
  supabaseKey.length > 20

const createMockClient = () =>
({
  from: (_: string) => ({
    select: (_cols?: string) => ({
      order: (_col: string, _opts?: object) => Promise.resolve({ data: [], error: null }),
      eq: (_col: string, _val: unknown) => ({
        order: (_c: string, _o?: object) => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        limit: (_n: number) => Promise.resolve({ data: [], error: null }),
      }),
      single: () => Promise.resolve({ data: null, error: null }),
      limit: (_n: number) => Promise.resolve({ data: [], error: null }),
    }),
  }),
} as any)

export const supabase = hasValidCreds
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient()

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Article {
  id: string
  slug: string
  title: string
  category: 'Class 10' | 'Class 12' | 'General'
  subject: string
  publish_date: string
  author: string
  excerpt: string
  content: string
  tags: string[]
  type: 'Question Paper' | 'Answer Key' | 'Analysis' | 'News' | 'Important Questions' | 'Study Material' | 'Syllabus'
  pdf_url?: string
  pdf_size?: string
  featured: boolean
  views: number
  created_at?: string
  updated_at?: string
}

export interface SiteSettings {
  id: number
  primary_color: string
  secondary_color: string
  font_family: string
  site_title: string
  updated_at?: string
}

export interface ExamSchedule {
  id: string
  class: '10' | '12'
  exam_date: string
  subject: string
  time: string
}

// ─── Article cache (60s TTL — new articles appear within 1 minute) ────────────
// NOTE: unstable_cache automatically includes function *arguments* in the cache key.
// So getCachedArticles('{"limit":10}') and getCachedArticles('{"category":"Class 12"}')
// are cached as SEPARATE entries. This fixes the shared-key bug.

const getCachedArticles = unstable_cache(
  async (filtersJson: string) => {
    try {
      const f = JSON.parse(filtersJson) as {
        category?: string; type?: string; limit?: number; featured?: boolean
      }
      let query = supabase
        .from('articles')
        .select('*')
        .order('publish_date', { ascending: false }) // always newest first

      if (f.category) query = query.eq('category', f.category)
      if (f.type) query = query.eq('type', f.type)
      if (f.featured) query = query.eq('featured', true)
      if (f.limit) query = query.limit(f.limit)

      const { data, error } = await query
      return { data: data as Article[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['articles'],          // base key — args are appended automatically by Next.js
  { revalidate: 60, tags: ['articles'] }   // ← 60 seconds so new posts appear fast
)

export async function getArticles(
  filters?: { category?: string; type?: string; limit?: number; featured?: boolean }
) {
  return getCachedArticles(JSON.stringify(filters ?? {}))
}

// ─── Single article (5 min cache — content rarely changes mid-day) ────────────

const getCachedArticleBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('articles').select('*').eq('slug', slug).single()
      return { data: data as Article | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['article-slug'],
  { revalidate: 300, tags: ['articles'] }  // 5 minutes
)

export async function getArticleBySlug(slug: string) {
  return getCachedArticleBySlug(slug)
}

// ─── Articles by category ─────────────────────────────────────────────────────

const getCachedArticlesByCategory = unstable_cache(
  async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('publish_date', { ascending: false })
      return { data: data as Article[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['articles-category'],
  { revalidate: 60, tags: ['articles'] }
)

export async function getArticlesByCategory(category: string) {
  return getCachedArticlesByCategory(category)
}

// ─── All slugs (for sitemap) ──────────────────────────────────────────────────

const getCachedAllSlugs = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabase.from('articles').select('slug, updated_at, publish_date, featured')
      return { data: data as { slug: string; updated_at?: string; publish_date: string; featured: boolean }[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['slugs'],
  { revalidate: 300, tags: ['articles'] }
)

export async function getAllSlugs() {
  return getCachedAllSlugs()
}

// ─── Exam schedules (24h cache — timetable never changes mid-season) ──────────

const getCachedExamSchedules = unstable_cache(
  async (classNum: string) => {
    try {
      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('class', classNum)
        .order('exam_date', { ascending: true })
      return { data: data as ExamSchedule[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['exam-schedules'],
  { revalidate: 86400, tags: ['exam_schedules'] }  // 24 hours
)

export async function getExamSchedules(classNum: '10' | '12') {
  return getCachedExamSchedules(classNum)
}

// ─── Site settings ────────────────────────────────────────────────────────────

export const getSiteSettings = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').single()
      return { data: data as SiteSettings | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['site-settings'],
  { revalidate: 3600, tags: ['site_settings'] }
)
