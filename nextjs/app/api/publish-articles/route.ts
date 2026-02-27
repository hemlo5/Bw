import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        const { article } = await req.json()

        if (!article?.slug || !article?.title) {
            return NextResponse.json({ error: 'Invalid article data' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const { error } = await supabase.from('articles').upsert({
            slug: article.slug,
            title: article.title,
            category: article.category,
            subject: article.subject,
            publish_date: new Date().toISOString(),
            author: 'BoardsWallah Expert Team',
            excerpt: article.excerpt,
            content: article.content,
            tags: article.tags,
            type: article.type,
            pdf_url: null,
            pdf_size: null,
            featured: true,
            views: 0,
        }, { onConflict: 'slug' })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, slug: article.slug })

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
}
