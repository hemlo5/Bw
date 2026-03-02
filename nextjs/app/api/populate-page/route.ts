import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SILICONFLOW_API_URL = 'https://api.siliconflow.com/v1/chat/completions'
// Fast 7B model — generates in ~20-30s instead of timing out
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-7B-Instruct'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

// ── All expected class/subject/type combinations ──────────────────────────────
const CLASS12_SUBJECTS = [
    'Physics', 'Chemistry', 'Mathematics', 'Biology',
    'Accountancy', 'Business Studies', 'Economics',
    'History', 'Geography', 'Political Science',
    'Computer Science', 'Physical Education',
    'English Core', 'Hindi Core',
]
const CLASS10_SUBJECTS = [
    'Science', 'Mathematics', 'Social Science',
    'English', 'Hindi', 'Sanskrit',
    'Computer Applications', 'Information Technology',
]
const TARGET_TYPES = ['Study Material', 'Important Questions', 'Syllabus']

export interface PageSlot {
    class: string   // 'Class 10' | 'Class 12'
    subject: string
    type: string   // 'Study Material' | 'Important Questions' | 'Syllabus'
    slug: string   // expected article slug
    hasArticle: boolean
    articleSlug?: string
}

// Compute what slug the article SHOULD have
function expectedSlug(cls: string, subject: string, type: string): string {
    const num = cls === 'Class 10' ? '10' : '12'
    const subSlug = subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const typeSlug: Record<string, string> = {
        'Study Material': 'study-material',
        'Important Questions': 'important-questions',
        'Syllabus': 'syllabus',
    }
    return `cbse-class-${num}-${subSlug}-${typeSlug[type]}-2026`
}

// ── GET — returns full gap list ───────────────────────────────────────────────
export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: articles } = await supabase
        .from('articles')
        .select('slug, subject, type, category')
        .in('type', TARGET_TYPES)

    const existingSlugs = new Set((articles || []).map((a: any) => a.slug))

    const slots: PageSlot[] = []
    for (const subject of CLASS12_SUBJECTS) {
        for (const type of TARGET_TYPES) {
            const slug = expectedSlug('Class 12', subject, type)
            slots.push({ class: 'Class 12', subject, type, slug, hasArticle: existingSlugs.has(slug) })
        }
    }
    for (const subject of CLASS10_SUBJECTS) {
        for (const type of TARGET_TYPES) {
            const slug = expectedSlug('Class 10', subject, type)
            slots.push({ class: 'Class 10', subject, type, slug, hasArticle: existingSlugs.has(slug) })
        }
    }

    return NextResponse.json({ slots })
}

// ── POST — generate + publish one slot ───────────────────────────────────────
export async function POST(req: NextRequest) {
    const { class: cls, subject, type } = await req.json()

    const apiKey = process.env.SILICONFLOW_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'SILICONFLOW_API_KEY missing' }, { status: 500 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
        return NextResponse.json({
            error: 'SUPABASE_SERVICE_ROLE_KEY not set',
            hint: 'Add to .env.local → Supabase Dashboard → Settings → API → service_role key',
        }, { status: 500 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey
    )

    const slug = expectedSlug(cls, subject, type)
    const num = cls === 'Class 10' ? '10' : '12'

    // Build a targeted prompt for each type
    const prompts: Record<string, string> = {
        'Study Material': `Write comprehensive CBSE ${cls} ${subject} study material 2026 for board exam preparation.
Cover all chapters with: key concepts, important formulas and definitions, diagrams/mnemonics, common mistakes to avoid, and chapter-wise marks weightage.
Make it a complete reference guide. Include a quick revision checklist at the end and top last-minute tips.
Target: students who want a single document to revise everything before CBSE boards.`,

        'Important Questions': `Write CBSE ${cls} ${subject} important questions 2026 for board exam.
Include: chapter-wise important questions (1 mark MCQs, 2 mark short answers, 3 mark, 5 mark long answers), case-based questions, assertion-reason questions, expected questions from previous years.
For each chapter give: probability of appearing in exam (★★★), and brief model answer for each question.
Based on latest CBSE exam pattern and syllabus 2025-26.`,

        'Syllabus': `Write a complete CBSE ${cls} ${subject} syllabus 2025-26 guide.
Include: unit-wise topic list with marks weightage, total marks split (theory + practical if applicable), paper pattern (number of questions per section, marks, time), deleted topics (if any from previous syllabus), prescribed books (NCERT + reference), and a month-wise study plan.
Also include: passing marks, grace marks policy, and section-wise strategy for max marks.`,
    }

    const systemPrompt = `You are an expert SEO content writer for BoardsWallah — India's #1 CBSE board exam website.

## OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown, no extra text.

## STRUCTURE
{
  "slug": "${slug}",
  "title": "Full SEO title with keywords | BoardsWallah",
  "type": "${type}",
  "category": "${cls}",
  "subject": "${subject}",
  "excerpt": "Exactly 150-160 char meta description with keywords naturally included.",
  "content": "<div class=\\"space-y-8\\">...rich HTML...</div>",
  "tags": ["exact search phrase 1", "...6-8 tags total"]
}

## CONTENT RULES
- Use Tailwind CSS classes in HTML
- Escape ALL double quotes in attributes as \\"
- H2 for main sections, H3 for subsections
- Include tables for: marks distribution, chapter list, formulas, important points
- Blue info boxes: <div class=\\"bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg\\">
- Yellow tip boxes: <div class=\\"bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg\\">
- Tags must be real Google search phrases Indian students use
- Title: start with "CBSE ${cls} ${subject}" and include the year 2026

Target length: ~2500-3500 words. Be genuinely useful, not generic filler.
Return ONLY the JSON object.`

    // Call SiliconFlow
    const sfRes = await fetch(SILICONFLOW_API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: SILICONFLOW_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompts[type] || prompts['Study Material'] },
            ],
            max_tokens: 8000,
            temperature: 0.7,
        }),
        signal: AbortSignal.timeout(120_000),
    })

    if (!sfRes.ok) {
        const err = await sfRes.text()
        return NextResponse.json({ error: `SiliconFlow: ${err}` }, { status: 500 })
    }

    const sfData = await sfRes.json()
    let rawText = (sfData.choices?.[0]?.message?.content || '').trim()
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1) {
        return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 })
    }

    let article: any
    try {
        article = JSON.parse(rawText.slice(start, end + 1))
    } catch {
        return NextResponse.json({ error: 'Failed to parse AI JSON response' }, { status: 500 })
    }

    // Force the slug to expected value so it definitely links correctly
    article.slug = slug

    // Publish to Supabase
    const { error: dbErr } = await supabase.from('articles').upsert({
        slug: article.slug,
        title: article.title,
        category: article.category || cls,
        subject: article.subject || subject,
        publish_date: new Date().toISOString(),
        author: 'BoardsWallah Expert Team',
        excerpt: article.excerpt,
        content: article.content,
        tags: article.tags || [],
        type: article.type || type,
        pdf_url: null,
        pdf_size: null,
        featured: true,
        views: 0,
    }, { onConflict: 'slug' })

    if (dbErr) {
        return NextResponse.json({ error: `DB error: ${dbErr.message}` }, { status: 500 })
    }

    return NextResponse.json({
        ok: true,
        slug: article.slug,
        title: article.title,
        url: `boardswallah.com/article/${article.slug}/`,
    })
}
