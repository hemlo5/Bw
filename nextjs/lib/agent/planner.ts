// AI Planner — SiliconFlow decides what to publish today
// Given: today's date, upcoming CBSE exams, recent news headlines
// Returns: a list of article briefs to generate

import type { NewsStory } from './news-fetcher'

const SF_URL = 'https://api.siliconflow.com/v1/chat/completions'
const SF_MODEL = 'Qwen/Qwen2.5-72B-Instruct'

export interface ArticleBrief {
    title: string
    slug: string
    type: 'Study Material' | 'Important Questions' | 'Answer Key' | 'News' | 'Quick Revision' | 'Exam Tips'
    category: 'Class 10' | 'Class 12' | 'General'
    subject: string
    reason: string          // why this article is timely
    pyqLink?: string        // link to our own PYQ page if relevant
    additionalContext: string   // extra context for the writer
}

interface PlannerInput {
    todayIST: string
    upcomingExams: Array<{ subject: string; category: string; daysUntil: number }>
    newsHeadlines: Array<{ headline: string; summary: string; sourceUrl: string; sourceName: string }>
    maxArticles: number
}

// PYQ pages that exist on BoardsWallah
const PYQ_PAGES: Record<string, string> = {
    'Class 10 Science': '/cbse-class-10-science-previous-year-question-papers',
    'Class 10 Maths': '/cbse-class-10-maths-previous-year-question-papers',
    'Class 10 Social Science': '/cbse-class-10-social-science-previous-year-question-papers',
    'Class 10 English': '/cbse-class-10-english-previous-year-question-papers',
    'Class 12 Physics': '/cbse-class-12-physics-previous-year-question-papers',
    'Class 12 Chemistry': '/cbse-class-12-chemistry-previous-year-question-papers',
    'Class 12 Mathematics': '/cbse-class-12-maths-previous-year-question-papers',
    'Class 12 Biology': '/cbse-class-12-biology-previous-year-question-papers',
    'Class 12 English': '/cbse-class-12-english-previous-year-question-papers',
}

export function getPYQLink(subject: string, category: string): string | undefined {
    return PYQ_PAGES[`${category} ${subject}`]
}

export async function planTodaysContent(input: PlannerInput): Promise<ArticleBrief[]> {
    const apiKey = process.env.SILICONFLOW_API_KEY
    if (!apiKey) throw new Error('SILICONFLOW_API_KEY not set')

    const examsText = input.upcomingExams.length > 0
        ? input.upcomingExams.map(e => `- ${e.category} ${e.subject}: ${e.daysUntil} days away`).join('\n')
        : '- No exams in the next 14 days'

    const newsText = input.newsHeadlines.length > 0
        ? input.newsHeadlines.map(n => `- "${n.headline}" (${n.sourceName})`).join('\n')
        : '- No major CBSE news today'

    const prompt = `Today is ${input.todayIST}. You are the content editor for BoardsWallah, India's top CBSE exam prep website.

UPCOMING CBSE EXAMS:
${examsText}

TODAY'S CBSE NEWS HEADLINES:
${newsText}

TASK: Decide which ${input.maxArticles} article(s) to publish today to maximize value for CBSE students.

Rules for your decision:
- If an exam is 1-3 days away → publish "Exam Tips" or "Quick Revision" for that subject
- If an exam is 4-7 days away → publish "Important Questions" or "Quick Revision" for that subject
- If an exam is 8-14 days away → publish "Study Material" or "Important Questions" for that subject
- If there's breaking CBSE news → publish a "News" article about it
- Mix calendar + news if slots allow
- Prefer subjects where students benefit most right now

Return ONLY a JSON array — no other text:
[
  {
    "title": "Full article title for SEO",
    "slug": "url-slug-here-${new Date().getFullYear()}",
    "type": "Study Material|Important Questions|Answer Key|News|Quick Revision|Exam Tips",
    "category": "Class 10|Class 12|General",
    "subject": "Maths|Science|Physics|etc",
    "reason": "Why this is the best article to publish today in one sentence",
    "additionalContext": "Specific angles, facts, or sections this article must cover"
  }
]`

    const res = await fetch(SF_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: SF_MODEL,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.5,
        }),
        signal: AbortSignal.timeout(60_000),
    })

    if (!res.ok) throw new Error(`Planner SiliconFlow error: ${res.status}`)
    const data = await res.json()
    const raw = (data.choices?.[0]?.message?.content || '').trim()

    // Parse JSON array
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start === -1 || end === -1) return []

    try {
        const plans = JSON.parse(raw.slice(start, end + 1)) as ArticleBrief[]
        // Attach PYQ links where applicable
        return plans.map(p => ({
            ...p,
            pyqLink: getPYQLink(p.subject, p.category),
        })).slice(0, input.maxArticles)
    } catch {
        return []
    }
}
