import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://example.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const hasValidCreds = supabaseUrl !== 'https://example.supabase.co' && supabaseKey !== 'placeholder'

const createMockClient = () => ({
  from: () => ({
    select: () => ({
      order: () => ({ data: [], error: null }),
      eq: function (this: any) { return this },
      single: () => ({ data: null, error: null }),
      limit: function (this: any) { return { data: [], error: null } },
    }),
  }),
}) as any

export const supabase = hasValidCreds ? createClient(supabaseUrl, supabaseKey) : createMockClient()

// ─── Shared cache TTL ────────────────────────────────────────────────────────
const CACHE_TTL = 3600 // 1 hour

// ─── Interfaces ──────────────────────────────────────────────────────────────

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

// ─── Article Queries (all cached) ────────────────────────────────────────────

export const getArticles = unstable_cache(
  async (filters?: { category?: string; type?: string; limit?: number; featured?: boolean }) => {
    let query = supabase.from('articles').select('*').order('publish_date', { ascending: false })
    if (filters?.category) query = query.eq('category', filters.category)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.featured) query = query.eq('featured', true)
    if (filters?.limit) query = query.limit(filters.limit)
    const { data, error } = await query
    return { data: data as Article[] | null, error }
  },
  ['articles-list'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getArticleBySlug = unstable_cache(
  async (slug: string) => {
    const { data, error } = await supabase
      .from('articles').select('*').eq('slug', slug).single()
    return { data: data as Article | null, error }
  },
  ['article-by-slug'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getArticlesByCategory = unstable_cache(
  async (category: string) => {
    const { data, error } = await supabase
      .from('articles').select('*').eq('category', category)
      .order('publish_date', { ascending: false })
    return { data: data as Article[] | null, error }
  },
  ['articles-by-category'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

export const getAllSlugs = unstable_cache(
  async () => {
    const { data, error } = await supabase.from('articles').select('slug')
    return { data: data as { slug: string }[] | null, error }
  },
  ['all-slugs'],
  { revalidate: CACHE_TTL, tags: ['articles'] }
)

// ─── Exam Schedules (cached) ──────────────────────────────────────────────────

export const getExamSchedules = unstable_cache(
  async (classNum: '10' | '12') => {
    const { data, error } = await supabase
      .from('exam_schedules').select('*').eq('class', classNum)
      .order('exam_date', { ascending: true })
    return { data: data as ExamSchedule[] | null, error }
  },
  ['exam-schedules'],
  { revalidate: CACHE_TTL, tags: ['exam_schedules'] }
)

// ─── Site Settings (cached) ──────────────────────────────────────────────────

export const getSiteSettings = unstable_cache(
  async () => {
    const { data, error } = await supabase.from('site_settings').select('*').single()
    return { data: data as SiteSettings | null, error }
  },
  ['site-settings'],
  { revalidate: CACHE_TTL, tags: ['site_settings'] }
)
