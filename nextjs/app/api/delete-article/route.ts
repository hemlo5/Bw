import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'bw@admin2026'

export async function POST(req: NextRequest) {
    try {
        const { slug, password } = await req.json()

        if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
        if (password !== ADMIN_PASSWORD)
            return NextResponse.json({ error: 'Wrong password' }, { status: 401 })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

        if (!supabaseUrl || !supabaseKey)
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

        const supabase = createClient(supabaseUrl, supabaseKey)
        const { error } = await supabase.from('articles').delete().eq('slug', slug)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, deleted: slug })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
}
