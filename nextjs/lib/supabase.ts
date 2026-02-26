import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

// ─── Env vars ────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Only create real client when both values look like real credentials
const hasValidCreds =
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('example.supabase.co') &&
  supabaseKey.length > 20

// ─── Mock client for build time / missing env vars ───────────────────────────
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

// ─── Shared cache TTL ─────────────────────────────────────────────────────────
const CACHE_TTL = 3600 // 1 hour

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

// ─── Article queries (cached) ─────────────────────────────────────────────────

export const getArticles = unstable_cache(
  async (filters?: { category?: string; type?: string; limit?: number; featured?: boolean }) => {
    try {
      let query = supabase.from('articles').select('*').order('publish_date', { ascending: false })
      if (filters?.category) query = query.eq('category', filters.category)
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.featured) query = query.eq('featured', true)
      if (filters?.limit) query = query.limit(filters.limit)
      const { data, error } = await query
      return { data: data as Article[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['articles-list'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getArticleBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('articles').select('*').eq('slug', slug).single()
      return { data: data as Article | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['article-by-slug'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getArticlesByCategory = unstable_cache(
  async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('articles').select('*').eq('category', category)
        .order('publish_date', { ascending: false })
      return { data: data as Article[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['articles-by-category'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getAllSlugs = unstable_cache(
  async () => {
    try {
      const { data, error } = await supabase.from('articles').select('slug')
      return { data: data as { slug: string }[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['all-slugs'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

// ─── Exam schedule queries (cached) ──────────────────────────────────────────

export const getExamSchedules = unstable_cache(
  async (classNum: '10' | '12') => {
    try {
      const { data, error } = await supabase
        .from('exam_schedules').select('*').eq('class', classNum)
        .order('exam_date', { ascending: true })
      return { data: data as ExamSchedule[] | null, error }
    } catch {
      return { data: null, error: new Error('DB unavailable') }
    }
  },
  ['exam-schedules'],
  { revalidate: CACHE_TTL, tags: ['exam_schedules'] }
)

// ─── Site settings (cached) ───────────────────────────────────────────────────

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
  { revalidate: CACHE_TTL, tags: ['site_settings'] }
)
