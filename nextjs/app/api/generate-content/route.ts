import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_API_URL = 'https://api.siliconflow.com/v1/chat/completions'
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-72B-Instruct'

const LENGTH_GUIDES: Record<string, string> = {
    small: 'Small (~400-600 words). 2-3 short sections. Tables with 3-4 rows max.',
    medium: 'Medium (~800-1200 words). 4-6 sections. Tables with 6-8 rows. Good detail on each point.',
    large: 'Large (~2000-3000 words). All sections with maximum detail. Tables with 10+ rows. Full solutions, student reactions, expert commentary, step-by-step answers.',
}

const SYSTEM_PROMPT = `You are an expert SEO content writer for BoardsWallah — India's CBSE board exam website. You generate structured article data as JSON.

## OUTPUT FORMAT
Return ONLY a valid JSON array. No other text, no markdown fences, no explanations.

## JSON STRUCTURE
\`\`\`
[
  {
    "type": "Answer Key",
    "slug": "cbse-class-12-chemistry-answer-key-2026",
    "title": "CBSE Class 12 Chemistry Answer Key 2026 (All Sets) - Unofficial Solution",
    "category": "Class 12",
    "subject": "Chemistry",
    "excerpt": "CBSE Class 12 Chemistry Answer Key 2026 for exam held 28 February. Unofficial solutions for Set 1, Set 2, Set 3. Section-wise MCQ answers, cutoff.",
    "content": "<div class=\\"space-y-6\\">...</div>",
    "tags": ["CBSE Class 12 Chemistry Answer Key 2026", "Chemistry Answer Key 28 February 2026", "..."]
  }
]
\`\`\`

## FIELD RULES
- type: exactly one of: Answer Key | Question Paper | Important Questions | Analysis | Study Material | News | Syllabus
- slug: cbse-class-{10|12}-{subject-kebab}-{type-kebab}-2026 (lowercase, hyphens only)
- title: include subject + class + type + year + keywords like "All Sets", "Unofficial", "PDF Download"  
- excerpt: 150-160 chars exactly, 3+ keywords
- content: rich HTML with Tailwind CSS classes. CRITICAL: escape ALL double quotes inside HTML attributes as \\" (backslash-quote)
- tags: 6-8 exact phrases students type on Google. Include variations with "cbse", "class 12", year, set numbers.

## CONTENT HTML STRUCTURE
Use these Tailwind classes. Always escape double quotes as \\":

Answer Key:
- Red banner: <div class=\\"bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg\\"><p class=\\"font-bold text-red-800\\">LIVE: Answer Key Released</p></div>
- Yellow disclaimer box
- Exam overview table (date, time, code, sets, marks)
- MCQ answer table with Q.No / Topic / Answer columns
- Section B/C short solutions
- Expected cutoff table (grade vs score)
- Internal links section

Question Paper: Green banner → Disclaimer → Exam overview table → Paper pattern table (Section/Questions/Marks) → Topics list → Internal links

Important Questions: Blue banner → Chapter weightage table (Chapter/Marks/★ Importance) → Expected questions per chapter with actual questions → Last-minute tips cards → Internal links

Analysis: Purple banner → 3 stat cards (difficulty/NCERT%/expected score) → Section-wise review divs → Student reactions (easy/moderate/hard) → Grade prediction table → Internal links

Study Material: Info banner → Key formulas per chapter (use <pre> or table) → Important concepts → Quick revision points → Internal links

## SEO RULES
- Titles must have: [Subject] Class [X] [Type] 2026 + power words
- Every internal link must use full path: /article/cbse-class-12-{subject}-answer-key-2026/
- Tags must include exact phrases: "CBSE Class 12 [Subject] Answer Key 2026", "Class 12 [Subject] board exam 2026", "[Subject] answer key set 1 set 2 set 3 2026", "CBSE [Subject] unofficial answer key 2026"

Return ONLY the JSON array. No text before or after.`

// Server-side SQL generation from structured article data (no AI parsing issues)
function articlesToSQL(articles: any[]): string {
    return articles.map(a => {
        const escapeSingle = (s: string) => (s || '').replace(/'/g, "''")
        const tagsSQL = `ARRAY[${(a.tags || []).map((t: string) => `'${escapeSingle(t)}'`).join(', ')}]`

        return `-- ${a.type}
INSERT INTO articles (slug, title, category, subject, publish_date, author, excerpt, content, tags, type, pdf_url, pdf_size, featured, views)
VALUES (
  '${escapeSingle(a.slug)}',
  '${escapeSingle(a.title)}',
  '${escapeSingle(a.category)}',
  '${escapeSingle(a.subject)}',
  NOW(),
  'BoardsWallah Expert Team',
  '${escapeSingle(a.excerpt)}',
  $$${a.content}$$,
  ${tagsSQL},
  '${escapeSingle(a.type)}',
  NULL,
  NULL,
  true,
  0
) ON CONFLICT (slug) DO UPDATE SET
  content      = EXCLUDED.content,
  title        = EXCLUDED.title,
  excerpt      = EXCLUDED.excerpt,
  tags         = EXCLUDED.tags,
  publish_date = NOW(),
  featured     = true;`
    }).join('\n\n')
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { subject, classNum, examDate, types, additionalContext, examCode, length = 'medium' } = body

        if (!subject || !classNum || !types?.length) {
            return NextResponse.json({ error: 'Missing required fields: subject, classNum, types' }, { status: 400 })
        }

        const apiKey = process.env.SILICONFLOW_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'SILICONFLOW_API_KEY not configured in Railway Variables' }, { status: 500 })
        }

        const date = examDate || new Date().toISOString().split('T')[0]
        const dateObj = new Date(date)
        const dateStr = dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

        const typeLabels: Record<string, string> = {
            'answer-key': 'Answer Key',
            'question-paper': 'Question Paper',
            'important-questions': 'Important Questions',
            'analysis': 'Analysis',
            'study-material': 'Study Material',
        }

        const requestedTypes = types.map((t: string) => typeLabels[t] || t)
        const lengthGuide = LENGTH_GUIDES[length] || LENGTH_GUIDES.medium

        const userPrompt = `Generate article data for the following CBSE exam:

Subject: ${subject}
Class: ${classNum}
Exam Date: ${dateStr} (${date})
Subject Code: ${examCode || 'standard CBSE code'}
Exam Notes: ${additionalContext || 'Standard CBSE board exam, moderate difficulty'}
Article Length: ${lengthGuide}
Content Types Required: ${requestedTypes.join(', ')}

Return exactly ${types.length} article object(s) in the JSON array — one per type: ${requestedTypes.join(', ')}.
Do NOT duplicate any type.
Use category: "Class ${classNum}"
Use internal link paths: /article/cbse-class-${classNum}-${subject.toLowerCase().replace(/\s+/g, '-')}-answer-key-2026/ etc.

Return ONLY the JSON array starting with [ and ending with ].`

        const response = await fetch(SILICONFLOW_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: SILICONFLOW_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 14000,
                temperature: 0.6,
                stream: false,
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            return NextResponse.json({ error: `SiliconFlow API error: ${err}` }, { status: 500 })
        }

        const data = await response.json()
        let rawText = (data.choices?.[0]?.message?.content || '').trim()

        // Strip markdown fences if AI added them despite instructions
        rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

        // Ensure it's just the JSON array
        const start = rawText.indexOf('[')
        const end = rawText.lastIndexOf(']')
        if (start === -1 || end === -1) {
            return NextResponse.json({ error: 'AI did not return valid JSON array. Try again.' }, { status: 500 })
        }
        rawText = rawText.slice(start, end + 1)

        let articles: any[]
        try {
            articles = JSON.parse(rawText)
        } catch (parseErr) {
            return NextResponse.json({
                error: 'Failed to parse AI response as JSON. Try generating again.',
                raw: rawText.slice(0, 500),
            }, { status: 500 })
        }

        if (!Array.isArray(articles) || articles.length === 0) {
            return NextResponse.json({ error: 'AI returned empty or invalid article list' }, { status: 500 })
        }

        // Generate SQL server-side from clean structured data (no formatting bugs)
        const sql = articlesToSQL(articles)

        // Build URL and preview data
        const urls = articles.map(a => ({
            slug: a.slug,
            url: `boardswallah.com/article/${a.slug}/`,
        }))

        const previews = articles.map((a, i) => ({
            index: i,
            html: a.content || '',
        }))

        return NextResponse.json({ sql, articles, urls, previews })

    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
