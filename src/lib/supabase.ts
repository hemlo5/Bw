import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create mock client for when Supabase is not configured
const createMockClient = () => {
  return {
    from: () => ({
      select: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      eq: () => ({ single: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      order: () => ({ limit: () => ({ data: null, error: { message: 'Supabase not configured' } }) }),
      ilike: () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }),
  } as any;
};

// Create client only if credentials exist
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : createMockClient();

// Flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Database types
export interface Article {
  id: string;
  slug: string;
  title: string;
  category: 'Class 10' | 'Class 12' | 'General';
  subject: string;
  publish_date: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  type: 'Question Paper' | 'Answer Key' | 'Analysis' | 'News' | 'Important Questions' | 'Study Material' | 'Syllabus';
  pdf_url?: string;
  pdf_size?: string;
  featured: boolean;
  views: number;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: number;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  site_title: string;
  updated_at?: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  password: string;
}

// Helper functions
export async function getArticles(filters?: { category?: string; type?: string; limit?: number }) {
  let query = supabase.from('articles').select('*').order('publish_date', { ascending: false });
  
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  return { data: data as Article[] | null, error };
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();
  return { data: data as Article | null, error };
}

export async function createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('articles').insert([article]).select().single();
  return { data: data as Article | null, error };
}

export async function updateArticle(id: string, article: Partial<Article>) {
  const { data, error } = await supabase
    .from('articles')
    .update({ ...article, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data: data as Article | null, error };
}

export async function deleteArticle(id: string) {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  return { error };
}

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').single();
  return { data: data as SiteSettings | null, error };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  const { data, error } = await supabase
    .from('site_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single();
  return { data: data as SiteSettings | null, error };
}
