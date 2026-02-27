import { NextRequest, NextResponse } from 'next/server'

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const SILICONFLOW_MODEL = 'Qwen/Qwen2.5-72B-Instruct'

const SYSTEM_PROMPT = `You are an expert SEO content writer and SQL developer for BoardsWallah — an Indian education website that publishes CBSE board exam papers, answer keys, and study material.

Your job is to generate PostgreSQL INSERT statements for articles that will be published as pages on boardswallah.com.

## ARTICLES TABLE SCHEMA
\`\`\`sql
articles (
  slug          TEXT UNIQUE,           -- URL slug, e.g. cbse-class-12-chemistry-answer-key-2026
  title         TEXT,                   -- Full SEO title
  category      TEXT,                   -- 'Class 10' OR 'Class 12' OR 'General'
  subject       TEXT,                   -- e.g. 'Chemistry', 'Mathematics', 'Physics'
  publish_date  TIMESTAMP,              -- Use NOW()
  author        TEXT,                   -- Always 'BoardsWallah Expert Team'
  excerpt       TEXT,                   -- 2-3 sentence SEO meta description (150-160 chars ideal)
  content       TEXT,                   -- Full HTML content (use $$ dollar quoting)
  tags          TEXT[],                 -- Array of exact search phrases students use
  type          TEXT,                   -- MUST be one of: 'Question Paper', 'Answer Key', 'Analysis', 'Important Questions', 'Study Material', 'News', 'Syllabus'
  pdf_url       TEXT,                   -- NULL (no PDF yet)
  pdf_size      TEXT,                   -- NULL
  featured      BOOLEAN,               -- true for important/timely articles
  views         INTEGER                 -- Start at 0
)
\`\`\`

## CRITICAL SQL FORMAT RULES
1. Use \$\$ dollar quoting for the content field — NEVER single quotes inside content HTML
2. Do NOT use \$\$ inside the HTML content itself (it would break the string)  
3. Always end with: ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content, publish_date = NOW(), featured = true;
4. Wrap entire INSERT in standard SQL syntax
5. Always use commas correctly between VALUES

## SLUG FORMAT
- cbse-class-{10|12}-{subject-lowercase}-{type-lowercase}-2026
- Examples: cbse-class-12-chemistry-answer-key-2026, cbse-class-10-maths-question-paper-2026

## CONTENT STRUCTURE (HTML inside \$\$...\$\$)
Each article content should include:
- A colored alert banner at top (red for live updates, blue for pre-exam, green for available)
- A disclaimer box (yellow) stating it's unofficial, not affiliated with CBSE
- Exam overview table (date, time, subject code, sets, marks)
- Main content sections relevant to the type:
  * Answer Key: MCQ table, section-wise solutions, expected cutoff
  * Question Paper: paper pattern table, topics covered, download info
  * Important Questions: chapter-wise weightage table, expected questions per chapter
  * Analysis: difficulty analysis cards, section-wise review, student reactions, marks prediction
  * Study Material: chapter summaries, key formulas, important concepts
- Internal links to related pages (answer key, question paper, category page)
- Use Tailwind CSS classes for styling

## SEO REQUIREMENTS
- Title must include: subject + class + year (2026) + type + keywords
- Include exact phrases students search on Google (e.g. "CBSE Class 12 Chemistry Answer Key 2026 Set 1 Set 2")
- Tags array: minimum 6 tags with exact student search phrases
- Excerpt: must be 150-160 characters, include keyword density

## OUTPUT FORMAT
Output ONLY valid SQL INSERT statements. No explanations before or after. No markdown code blocks. Just raw SQL starting with -- followed by the article type, then the INSERT.
Multiple articles = multiple INSERT statements separated by blank lines.`

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { subject, classNum, examDate, types, additionalContext, examCode } = body

        if (!subject || !classNum || !types?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const apiKey = process.env.SILICONFLOW_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'SILICONFLOW_API_KEY not set in environment variables' },
                { status: 500 }
            )
        }

        const date = examDate || new Date().toISOString().split('T')[0]
        const dateObj = new Date(date)
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

        const typeLabels: Record<string, string> = {
            'answer-key': 'Answer Key',
            'question-paper': 'Question Paper',
            'important-questions': 'Important Questions',
            'analysis': 'Paper Analysis',
            'study-material': 'Study Material',
        }

        const requestedTypes = types.map((t: string) => typeLabels[t] || t).join(', ')

        const userPrompt = `Generate SQL INSERT statements for the following exam content:

Subject: ${subject}
Class: ${classNum}
Exam Date: ${dateStr} (${date})
Subject Code: ${examCode || 'as per CBSE'}
Content Types Needed: ${requestedTypes}
Additional Context: ${additionalContext || 'Standard CBSE board exam. Moderate difficulty.'}

Generate one complete SQL INSERT per content type requested. Make all content India-exam relevant, detailed, and SEO optimized for students searching on Google in India.

Remember: use $$ dollar quoting for content field. No single quotes inside content.`

        const response = await fetch(SILICONFLOW_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: SILICONFLOW_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 12000,
                temperature: 0.7,
                stream: false,
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            return NextResponse.json({ error: `SiliconFlow API error: ${err}` }, { status: 500 })
        }

        const data = await response.json()
        const sql = data.choices?.[0]?.message?.content || ''

        if (!sql) {
            return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 })
        }

        return NextResponse.json({ sql })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
