// Content Generator — SiliconFlow (Qwen2.5-72B) writes human-like articles
// Uses a DELIMITED format to avoid HTML-inside-JSON parsing failures:
//   METADATA section → simple JSON (no HTML, always parses cleanly)
//   CONTENT section  → raw HTML (no JSON escaping issues)

const SF_URL = 'https://api.siliconflow.com/v1/chat/completions'
const SF_MODEL = 'Qwen/Qwen2.5-72B-Instruct'

import { getImageForSubject, getChartScript } from './image-fetcher'
import type { PublishTrigger } from './calendar'
import type { NewsStory } from './news-fetcher'

export interface GeneratedArticle {
    slug: string
    title: string
    excerpt: string
    content: string
    tags: string[]
}

// ── SiliconFlow call with 3× retry ───────────────────────────────────────────
async function sfCall(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.SILICONFLOW_API_KEY
    if (!apiKey) throw new Error('SILICONFLOW_API_KEY not set')

    let lastErr = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const res = await fetch(SF_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: SF_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    max_tokens: 8000,
                    temperature: 0.75,
                }),
                signal: AbortSignal.timeout(180_000),
            })

            if (!res.ok) {
                const txt = await res.text()
                if (txt.startsWith('<!') || txt.startsWith('<html')) {
                    const m = txt.match(/<title>([^<]+)<\/title>/)
                    throw new Error(m ? `SiliconFlow: ${m[1].trim()}` : `SiliconFlow HTTP ${res.status}`)
                }
                throw new Error(`SiliconFlow ${res.status}: ${txt.slice(0, 200)}`)
            }

            const data = await res.json()
            return (data.choices?.[0]?.message?.content || '').trim()
        } catch (e: any) {
            lastErr = e.message
            if (attempt < 3) await new Promise(r => setTimeout(r, 5000 * attempt))
        }
    }
    throw new Error(lastErr || 'SiliconFlow failed after 3 retries')
}

// ── Parse the delimited response ─────────────────────────────────────────────
// Format we ask for:
//   ===METADATA===
//   {"slug":"...","title":"...","excerpt":"...","tags":["..."]}
//   ===CONTENT===
//   <actual HTML here>
function parseDelimited(raw: string, fallbackSlug: string, fallbackTitle: string): GeneratedArticle {
    const metaMatch = raw.match(/===METADATA===\s*([\s\S]*?)\s*===CONTENT===/i)
    const contentMatch = raw.match(/===CONTENT===\s*([\s\S]*?)(?:===END===|$)/i)

    let slug = fallbackSlug
    let title = fallbackTitle
    let excerpt = 'Read the full article on BoardsWallah.'
    let tags: string[] = []
    let content = ''

    // Parse metadata (simple JSON, no HTML, should always work)
    if (metaMatch) {
        try {
            const meta = JSON.parse(metaMatch[1].trim())
            slug = meta.slug || slug
            title = meta.title || title
            excerpt = meta.excerpt || excerpt
            tags = meta.tags || []
        } catch { /* keep fallback values */ }
    }

    // Content is just raw text — no JSON parsing needed
    if (contentMatch) {
        content = contentMatch[1].trim()
    } else {
        // Fallback: if model ignored format, try to find HTML
        const htmlStart = raw.indexOf('<')
        content = htmlStart !== -1 ? raw.slice(htmlStart) : raw
    }

    return { slug, title, excerpt, content, tags }
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM = `You are a senior education journalist for BoardsWallah, India's top CBSE exam prep site. Write for Class 10 and 12 students preparing for board exams.

Style:
- Friendly, clear, authoritative — like a helpful senior who aced boards
- Use real CBSE data, marks weightage, official statistics
- Write in Indian English: "marks", "appearing candidates", "compartment exam"
- Minimum 1200 words of actual content
- Every paragraph must add real value — no generic filler

HTML rules (use Tailwind CSS classes):
- Headings: <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">
- Sub-headings: <h3 class="text-xl font-semibold text-gray-800 mt-6 mb-3">
- Info boxes: <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg my-4">
- Lists: <ul class="list-disc pl-6 space-y-2 my-4">
- Tables: <table class="w-full border-collapse my-6"><thead class="bg-gray-50">
- Citations: <a href="URL" class="text-blue-600 hover:underline" target="_blank" rel="noopener">Source Name</a>
- Pull quotes: <blockquote class="border-l-4 border-sky-500 pl-4 italic text-gray-700 my-6">

REQUIRED OUTPUT FORMAT — follow exactly:
===METADATA===
{"slug":"url-slug-here","title":"Full SEO Title","excerpt":"150-180 char description","tags":["tag1","tag2","tag3","tag4","tag5"]}
===CONTENT===
<your full HTML content here — NO JSON, just HTML>
===END===`

// ── Generate from calendar trigger ───────────────────────────────────────────
export async function generateCalendarArticle(trigger: PublishTrigger): Promise<GeneratedArticle> {
    const image = getImageForSubject(trigger.subject, trigger.type)
    const chart = getChartScript(trigger.subject, trigger.type)
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    const hero = `<img src="${image.url}" alt="${image.alt}" class="w-full h-64 md:h-80 object-cover rounded-2xl mb-6" loading="lazy" />`
    const byline = `<div class="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100"><div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm">BW</div><div><p class="font-semibold text-gray-900 text-sm">BoardsWallah Expert Team</p><p class="text-xs text-gray-500">Published ${today} · 8 min read</p></div></div>`

    const prompt = `Write a complete, human-quality article for:

TITLE: ${trigger.title}
SUBJECT: ${trigger.subject} | CLASS: ${trigger.category} | TYPE: ${trigger.type}
SLUG: ${trigger.slug}
CONTEXT: ${trigger.reason}

In the CONTENT section:
1. Start with exactly this hero block (copy verbatim): ${hero}${byline}
2. Then write at least 1200 words of real content with Tailwind styled HTML
3. Include actual CBSE syllabus units, marks weightage, real statistics
4. Cite official sources: cbse.gov.in, ncert.nic.in with real working links
5. Add this chart block somewhere after the main content: ${chart}
6. End with a FAQ section (5-7 real student questions with detailed answers)

Follow the ===METADATA=== / ===CONTENT=== / ===END=== format exactly.`

    const raw = await sfCall(SYSTEM, prompt)
    return parseDelimited(raw, trigger.slug, trigger.title)
}

// ── Generate from news story ──────────────────────────────────────────────────
export async function generateNewsArticle(story: NewsStory): Promise<GeneratedArticle> {
    const image = getImageForSubject('default')
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const slug = story.headline.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)
        + `-${new Date().getFullYear()}`

    const hero = `<img src="${image.url}" alt="${image.alt}" class="w-full h-64 md:h-80 object-cover rounded-2xl mb-6" loading="lazy" />`
    const byline = `<div class="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100"><div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm">BW</div><div><p class="font-semibold text-gray-900 text-sm">BoardsWallah News Desk</p><p class="text-xs text-gray-500">Published ${today} · 5 min read</p></div></div>`

    const prompt = `Write a complete news article for CBSE students about this story:

HEADLINE: ${story.headline}
SUMMARY: ${story.summary}
SOURCE: ${story.sourceName} — ${story.sourceUrl}
SLUG: ${slug}

In the CONTENT section:
1. Start with exactly this block (copy verbatim): ${hero}${byline}
2. Write at least 800 words covering what happened and why it matters
3. Include a "What This Means for Students" section
4. Link to the original source: <a href="${story.sourceUrl}" class="text-blue-600 hover:underline" target="_blank" rel="noopener">${story.sourceName}</a>
5. End with 3-5 FAQs students might have about this news

Follow the ===METADATA=== / ===CONTENT=== / ===END=== format exactly.`

    const raw = await sfCall(SYSTEM, prompt)
    return parseDelimited(raw, slug, story.headline)
}

// ── Generate from AI planner brief (main entry point) ────────────────────────
import type { ArticleBrief } from './planner'

export async function generateFromBrief(brief: ArticleBrief): Promise<GeneratedArticle> {
    const image = getImageForSubject(brief.subject, brief.type)
    const chart = getChartScript(brief.subject, brief.type)
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const isNews = brief.type === 'News'

    const hero = `<img src="${image.url}" alt="${image.alt}" class="w-full h-64 md:h-80 object-cover rounded-2xl mb-6" loading="lazy" />`
    const byline = `<div class="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100"><div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm">BW</div><div><p class="font-semibold text-gray-900 text-sm">${isNews ? 'BoardsWallah News Desk' : 'BoardsWallah Expert Team'}</p><p class="text-xs text-gray-500">Published ${today} · ${isNews ? '5' : '8'} min read</p></div></div>`

    // PYQ link box — links back to our own site
    const pyqBox = brief.pyqLink
        ? `<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 my-6 flex items-center gap-4">
  <span class="text-3xl">📄</span>
  <div>
    <p class="font-semibold text-indigo-900">Practice with Previous Year Papers</p>
    <p class="text-sm text-indigo-700 mt-0.5">Solving PYQs is the fastest way to prepare. Download free PDFs:</p>
    <a href="${brief.pyqLink}" class="inline-block mt-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 underline" target="_blank" rel="noopener">
      CBSE ${brief.category} ${brief.subject} Previous Year Question Papers →
    </a>
  </div>
</div>`
        : ''

    const prompt = `Today is ${today}. Write a complete, human-quality article:

TITLE: ${brief.title}
SLUG: ${brief.slug}
TYPE: ${brief.type} | SUBJECT: ${brief.subject} | CLASS: ${brief.category}
WHY TODAY: ${brief.reason}
SPECIFIC REQUIREMENTS: ${brief.additionalContext}

In the CONTENT section:
1. Start with exactly this block (copy verbatim): ${hero}${byline}
2. Write at least ${isNews ? '800' : '1200'} words — be specific, not generic
3. Include real CBSE ${brief.subject} data: marks weightage, syllabus chapters, official sources
4. After the intro section, include this PYQ link box (copy verbatim): ${pyqBox}
5. Include relevant statistics and cite real sources (cbse.gov.in, ncert.nic.in)
${chart ? `6. Include this chart block after the main content (copy verbatim): ${chart}` : ''}
7. End with a 5-7 question FAQ with detailed answers

Follow the ===METADATA=== / ===CONTENT=== / ===END=== format exactly.`

    const raw = await sfCall(SYSTEM, prompt)
    return parseDelimited(raw, brief.slug, brief.title)
}
