import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_API_URL = 'https://api.siliconflow.com/v1/chat/completions'
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-7B-Instruct'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const LENGTH_GUIDES: Record<string, string> = {
    small: 'Standard article (~1500-2000 words). 4-6 well-padded sections.',
    medium: 'Detailed article (~2500-3500 words). 7-10 in-depth sections with examples, tips, tables.',
    large: 'Exhaustive mega-article (~5000-7000 words). Every conceivable angle covered. FAQs, comparison tables, expert tips, common mistakes, step-by-step breakdowns — EVERYTHING.',
}

const SYSTEM_PROMPT = `You are an expert SEO content writer for BoardsWallah — India's top education website for CBSE board exams. You write engaging, informative articles that rank on Google.

## OUTPUT FORMAT
Return ONLY a valid JSON object (not an array). No other text before or after.

## JSON STRUCTURE
{
  "slug": "url-friendly-seo-slug-max-60-chars",
  "title": "Full SEO Title With Target Keywords | BoardsWallah",
  "type": "Study Material",
  "category": "Class 12",
  "subject": "Chemistry",
  "excerpt": "Exactly 150-160 character meta description with 3+ target keywords naturally included.",
  "content": "<div class=\\"space-y-8\\">...rich HTML content...</div>",
  "tags": ["exact phrase 1", "exact phrase 2", "...6-8 total"]
}

## FIELD RULES
- slug: lowercase, hyphens only, 50-70 chars, include main keyword
- title: include primary keyword near start, add year (2026) if relevant, keep under 65 chars for SERP
- type: pick best fit from — Study Material | News | Analysis | Question Paper | Answer Key | Important Questions | Syllabus | General
- category: Class 10 | Class 12 | General
- subject: the specific subject name if applicable, else "General"
- excerpt: 150-160 chars EXACTLY. Natural sentence with keywords. No truncation.
- content: Rich HTML using Tailwind CSS classes. CRITICAL: escape ALL double quotes in HTML attributes as \\"
- tags: 6-8 exact Google search phrases students type

## CONTENT HTML GUIDELINES
Structure content with Tailwind classes. Use these patterns:
- Intro with key info box: <div class=\\"bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg\\">
- Section headers: <h2 class=\\"text-2xl font-bold text-gray-900 mb-4\\">
- Sub-headers: <h3 class=\\"text-xl font-semibold text-gray-800 mb-3\\">
- Info cards: <div class=\\"bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6\\">
- Tables: <table class=\\"min-w-full divide-y divide-gray-200\\"> with proper thead/tbody
- Tips box: <div class=\\"bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg\\">
- Numbered lists: <ol class=\\"list-decimal list-inside space-y-2 text-gray-700\\">
- Bullet lists: <ul class=\\"list-disc list-inside space-y-2 text-gray-700\\">
- Always include an internal links section at the bottom with: <a href=\\"/category/class-10/\\" class=\\"text-sky-600 hover:underline\\">

## SEO RULES
- First sentence must contain the primary keyword
- Use H2s for main sections, H3s for subsections
- Include numeric data, statistics, and specifics where relevant
- Tags must be exact search phrases people type on Google India
- Make content genuinely useful, not filler

Return ONLY the JSON object.`

// Server-side SQL generation
function articleToSQL(a: any): string {
    const esc = (s: string) => (s || '').replace(/'/g, "''")
    const tags = `ARRAY[${(a.tags || []).map((t: string) => `'${esc(t)}'`).join(', ')}]`
    return `-- ${a.type}: ${a.title}
INSERT INTO articles (slug, title, category, subject, publish_date, author, excerpt, content, tags, type, pdf_url, pdf_size, featured, views)
VALUES (
  '${esc(a.slug)}',
  '${esc(a.title)}',
  '${esc(a.category)}',
  '${esc(a.subject)}',
  NOW(),
  'BoardsWallah Expert Team',
  '${esc(a.excerpt)}',
  $$${a.content}$$,
  ${tags},
  '${esc(a.type)}',
  NULL, NULL, true, 0
) ON CONFLICT (slug) DO UPDATE SET
  content      = EXCLUDED.content,
  title        = EXCLUDED.title,
  excerpt      = EXCLUDED.excerpt,
  tags         = EXCLUDED.tags,
  publish_date = NOW(),
  featured     = true;`
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, category, subject, articleType, length = 'medium' } = await req.json()

        if (!prompt?.trim()) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const apiKey = process.env.SILICONFLOW_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'SILICONFLOW_API_KEY not configured' }, { status: 500 })
        }

        const lengthGuide = LENGTH_GUIDES[length] || LENGTH_GUIDES.medium
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

        const userPrompt = `Write an SEO article for BoardsWallah based on this prompt:
"${prompt}"

Details:
- Category: ${category || 'General'}
- Subject: ${subject || 'General'}
- Article Type: ${articleType || 'Study Material'}
- Today's Date: ${today}
- Length: ${lengthGuide}

Make it genuinely useful for Indian students preparing for CBSE board exams.
Return ONLY the JSON object, nothing else.`

        const response = await fetch(SILICONFLOW_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: SILICONFLOW_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 3000,
                temperature: 0.7,
                stream: false,
            }),
            signal: AbortSignal.timeout(90_000),
        })

        if (!response.ok) {
            const err = await response.text()
            return NextResponse.json({ error: `SiliconFlow error: ${err}` }, { status: 500 })
        }

        const data = await response.json()
        let rawText = (data.choices?.[0]?.message?.content || '').trim()
        rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

        // Find JSON object bounds
        const start = rawText.indexOf('{')
        const end = rawText.lastIndexOf('}')
        if (start === -1 || end === -1) {
            return NextResponse.json({ error: 'AI did not return valid JSON. Try again.' }, { status: 500 })
        }

        let article: any
        try {
            article = JSON.parse(rawText.slice(start, end + 1))
        } catch {
            return NextResponse.json({ error: 'Failed to parse AI response. Try regenerating.' }, { status: 500 })
        }

        const sql = articleToSQL(article)

        return NextResponse.json({
            sql,
            article,
            url: `boardswallah.com/article/${article.slug}/`,
            preview: article.content || '',
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
}
