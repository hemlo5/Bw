import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SILICONFLOW_API_URL = 'https://api.siliconflow.com/v1/chat/completions'
// Fast 7B model — generates in ~20-30s vs 4+ min for 72B
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-7B-Instruct'

// Allow route up to 5 min; fixes UND_ERR_HEADERS_TIMEOUT in local dev
export const maxDuration = 300
export const dynamic = 'force-dynamic'

// Default threshold — overridable via ?threshold= query param
const DEFAULT_THRESHOLD = 1500

// Map target chars → max_tokens (rough: 1 token ≈ 4 chars)
function charsToTokens(chars: number): number {
    // 1 token ≈ 3.5 chars; add 40% buffer for JSON overhead. No upper cap.
    return Math.max(600, Math.ceil((chars / 3.5) * 1.4))
}

// ── GET — find all thin/empty articles ───────────────────────────────────────
export async function GET(req: NextRequest) {
    const threshold = parseInt(req.nextUrl.searchParams.get('threshold') || String(DEFAULT_THRESHOLD), 10)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, slug, title, type, category, subject, content, excerpt')
        .order('publish_date', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Filter articles where content is null/empty/short or contains placeholder phrases
    const placeholderPhrases = [
        'coming soon', 'placeholder', 'lorem ipsum', 'content here',
        'will be updated', 'to be added', 'check back', 'demo content',
    ]

    const thinArticles = (articles || []).filter(a => {
        const contentLen = (a.content || '').length
        const contentLow = (a.content || '').toLowerCase()
        const isShort = contentLen < threshold
        const isPlaceholder = placeholderPhrases.some(p => contentLow.includes(p))
        return isShort || isPlaceholder
    }).map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        type: a.type,
        category: a.category,
        subject: a.subject,
        excerpt: a.excerpt,
        contentLen: (a.content || '').length,
    }))

    return NextResponse.json({ articles: thinArticles, total: (articles || []).length, threshold })
}

// ── POST — regenerate content for one article ─────────────────────────────────
export async function POST(req: NextRequest) {
    const { slug, targetChars = 1500 } = await req.json()
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    // Build fallback SQL for manual copy-paste
    function buildSQL(slug: string, article: any, original: any): string {
        const esc = (s: string) => (s || '').replace(/'/g, "''")
        const tags = `ARRAY[${(article.tags || []).map((t: string) => `'${esc(t)}'`).join(', ')}]`
        return `-- Fix: ${original.type}: ${original.title.slice(0, 60)}
UPDATE articles SET
  content      = $$${article.content}$$,
  excerpt      = '${esc(article.excerpt || original.excerpt || '')}',
  tags         = ${tags},
  publish_date = NOW(),
  featured     = true
WHERE slug = '${esc(slug)}';`
    }

    const apiKey = process.env.SILICONFLOW_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'SILICONFLOW_API_KEY not configured' }, { status: 500 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
        return NextResponse.json({
            error: 'SUPABASE_SERVICE_ROLE_KEY not set',
            hint: 'Add it to .env.local → Supabase Dashboard → Settings → API → service_role, then restart npm run dev.',
        }, { status: 500 })
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey   // service role bypasses RLS — correct for server-side admin writes
    )

    // Fetch current article data
    const { data: article, error: fetchErr } = await supabase
        .from('articles')
        .select('slug, title, type, category, subject, excerpt, tags')
        .eq('slug', slug)
        .single()

    if (fetchErr || !article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Build a tailored prompt from the article's own title + type
    const prompt = buildPrompt(article)

    const systemPrompt = `You are an expert SEO content writer for BoardsWallah — India's top CBSE board exam website.

## OUTPUT FORMAT
Return ONLY a valid JSON object. No markdown fence, no extra text.

## STRUCTURE  
{
  "slug": "${slug}",
  "title": "${article.title.replace(/"/g, '\\"')}",
  "type": "${article.type}",
  "category": "${article.category}",
  "subject": "${article.subject}",
  "excerpt": "150-160 char meta description with main keywords",
  "content": "<div class=\\"space-y-8\\">...rich HTML content...</div>",
  "tags": ["search phrase 1", "...6-8 exact Google search phrases"]
}

## CONTENT RULES
- Use Tailwind CSS classes in all HTML
- Escape ALL double quotes inside HTML attributes as \\"
- H2 for main sections, H3 for subsections  
- Include data tables, info boxes, tips, numbered lists
- Blue info boxes: <div class=\\"bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg\\">
- Yellow tip boxes: <div class=\\"bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg\\">
- Green success boxes: <div class=\\"bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg\\">
- Target: ~${Math.round(targetChars / 5)} words (approximately ${targetChars} characters) of useful, structured content for Indian CBSE students
- Tags: real phrases Indian students search on Google

Keep slug and title EXACTLY as given. Return ONLY the JSON.`

    const maxTokens = charsToTokens(targetChars)

    // Helper: parse SiliconFlow error response into a readable message
    const parseSFError = async (res: Response): Promise<string> => {
        const txt = await res.text()
        if (txt.startsWith('<!') || txt.startsWith('<html')) {
            // Extract title from HTML error page (e.g. "504: Gateway time-out")
            const m = txt.match(/<title>([^<]+)<\/title>/)
            return m ? `SiliconFlow server error: ${m[1].trim()}. Please retry in 30s.`
                : `SiliconFlow server returned HTML error (status ${res.status}). Retry in 30s.`
        }
        try { return JSON.parse(txt)?.message || txt.slice(0, 200) }
        catch { return txt.slice(0, 300) }
    }

    // Auto-retry up to 3 times with 4s backoff (handles 504 Gateway Timeout)
    let sfRes: Response | null = null
    let sfErr = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            sfRes = await fetch(SILICONFLOW_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: SILICONFLOW_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt },
                    ],
                    max_tokens: maxTokens,
                    temperature: 0.7,
                }),
                signal: AbortSignal.timeout(120_000),
            })
            if (sfRes.ok) break  // success — exit retry loop
            sfErr = await parseSFError(sfRes)
            sfRes = null
        } catch (fetchErr: any) {
            sfErr = `Network error (attempt ${attempt}/3): ${fetchErr.message}`
            sfRes = null
        }
        if (attempt < 3) await new Promise(r => setTimeout(r, 4000 * attempt))  // 4s, 8s
    }

    if (!sfRes) {
        return NextResponse.json({ error: sfErr || 'SiliconFlow unavailable after 3 retries' }, { status: 500 })
    }

    const sfData = await sfRes.json()
    let rawText = (sfData.choices?.[0]?.message?.content || '').trim()
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    const start = rawText.indexOf('{')
    if (start === -1) {
        return NextResponse.json({
            error: 'AI returned no JSON object at all',
            rawText,
        }, { status: 500 })
    }

    // If JSON was truncated (no closing }), try to salvage it
    let jsonStr = rawText.slice(start)
    const end = jsonStr.lastIndexOf('}')
    if (end === -1) {
        // Force-close the truncated JSON: close string + close object
        // This salvages all fully-completed fields (title, excerpt, tags, etc.)
        jsonStr = jsonStr + '"}</div>"}'
    } else {
        jsonStr = jsonStr.slice(0, end + 1)
    }

    let generated: any
    try {
        generated = JSON.parse(jsonStr)
    } catch {
        // Last resort: try to extract individual fields with regex
        const extractField = (field: string) => {
            const m = rawText.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*?)"`))
            return m ? m[1] : ''
        }
        const extractContent = () => {
            const m = rawText.match(/"content"\s*:\s*"([\s\S]*?)(?=",\s*"tags"|"\s*}|$)/)
            return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : rawText.slice(start)
        }
        generated = {
            slug: extractField('slug') || slug,
            title: extractField('title') || article.title,
            excerpt: extractField('excerpt') || '',
            type: extractField('type') || article.type,
            content: extractContent() + '</div>',
            tags: [],
        }
    }

    // Force keep original slug/title
    generated.slug = slug
    generated.title = article.title

    const sql = buildSQL(slug, generated, article)

    // Update in DB — if anon key lacks UPDATE permission, return SQL as fallback
    const { error: updateErr } = await supabase
        .from('articles')
        .update({
            content: generated.content,
            excerpt: generated.excerpt || article.excerpt,
            tags: generated.tags || article.tags || [],
            publish_date: new Date().toISOString(),
            featured: true,
        })
        .eq('slug', slug)

    if (updateErr) {
        const msg = typeof updateErr.message === 'string' && updateErr.message.length < 300
            ? updateErr.message
            : `DB error (code ${(updateErr as any).code || 'unknown'})`
        return NextResponse.json({
            error: `DB update failed: ${msg}`,
            sql,
            hint: 'Copy the SQL below and run it in your Supabase SQL Editor to apply manually.',
        }, { status: 500 })
    }

    return NextResponse.json({ ok: true, slug, title: article.title, sql })
}

// ── Build prompt from article metadata ────────────────────────────────────────
function buildPrompt(a: { title: string; type: string; category: string; subject: string }): string {
    const typePrompts: Record<string, string> = {
        'Answer Key': `Write a detailed unofficial answer key article based on the title "${a.title}".
Include: section-wise answers (MCQ, short answer, long answer), set-wise breakdown (Set 1, Set 2, Set 3), marks distribution table, expected difficulty analysis, student reactions, cutoff predictions, and important disclaimers.`,

        'Question Paper': `Write a comprehensive question paper analysis page based on "${a.title}".
Include: exam overview table (date, time, code, sets), section-wise breakdown (Section A MCQs, B short, C long), difficulty analysis, chapter-wise question distribution table, expected marks needed for various grades, and preparation tips for next year.`,

        'Important Questions': `Write a complete important questions guide based on "${a.title}".
Include: chapter-wise important questions (1 mark, 2 mark, 3-4 mark, 5 mark), model answers for key questions, assertion-reason questions, case-based questions, probability of each question appearing (★★★ rating), and last-minute revision tips.`,

        'Study Material': `Write comprehensive study material based on "${a.title}".
Include: chapter-wise notes with key concepts, important formulas and definitions, mnemonics, common mistakes to avoid, NCERT important questions, chapter-wise marks weightage, and quick revision summary.`,

        'Analysis': `Write a detailed post-exam analysis article based on "${a.title}".
Include: overall difficulty rating, section-wise difficulty analysis, unexpected questions, easy marks sections, student reactions (quotes), expert opinion, comparison with previous years, expected cutoff, and advice for upcoming exams.`,

        'Syllabus': `Write a complete syllabus guide based on "${a.title}".
Include: unit-wise topic list with marks, chapter names, deleted portions, paper pattern, prescribed books, marks breakdown (theory + practical), time allocation, and chapter-wise study strategy.`,
    }

    return typePrompts[a.type] || `Write a detailed, SEO-optimized article for the CBSE board exam page titled "${a.title}". Subject: ${a.subject}, Category: ${a.category}, Type: ${a.type}. Make it genuinely useful for Indian students with 2500+ words of real content.`
}
