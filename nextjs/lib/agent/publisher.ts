// Publisher — writes articles to Supabase using service role key (bypasses RLS)

import { createClient } from '@supabase/supabase-js'

export interface ArticlePayload {
    slug: string
    title: string
    type: string
    category: string
    subject: string
    excerpt: string
    content: string
    tags: string[]
    author?: string
}

export async function publishArticle(article: ArticlePayload): Promise<{ ok: boolean; error?: string }> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return { ok: false, error: 'Supabase credentials not configured' }

    const supabase = createClient(url, key)

    // Check if slug already exists (don't overwrite good content)
    const { data: existing } = await supabase
        .from('articles')
        .select('slug, content')
        .eq('slug', article.slug)
        .single()

    if (existing?.content && existing.content.length > 2000) {
        return { ok: false, error: `Skipped — article already has content (${existing.content.length} chars)` }
    }

    const { error } = await supabase.from('articles').upsert({
        slug: article.slug,
        title: article.title,
        type: article.type,
        category: article.category,
        subject: article.subject,
        excerpt: article.excerpt,
        content: article.content,
        tags: article.tags,
        author: article.author || 'BoardsWallah Expert Team',
        publish_date: new Date().toISOString(),
        featured: true,
        views: 0,
        pdf_url: null,
        pdf_size: null,
    }, { onConflict: 'slug' })

    if (error) return { ok: false, error: error.message }
    return { ok: true }
}
