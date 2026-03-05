// Main Agent Orchestrator — AI-driven pipeline
// Step 1: Fetch news headlines
// Step 2: Get upcoming exams list
// Step 3: AI Planner decides what articles to write today
// Step 4: Generate + publish each planned article

import { getUpcomingExams } from './calendar'
import { fetchCBSENews } from './news-fetcher'
import { planTodaysContent, type ArticleBrief } from './planner'
import { generateFromBrief } from './content-generator'
import { publishArticle } from './publisher'
import { createClient } from '@supabase/supabase-js'

export interface AgentRunLog {
    startedAt: string
    finishedAt: string
    plan: ArticleBrief[]
    published: Array<{ slug: string; title: string; type: string; source: 'calendar' | 'news' | 'planned' }>
    skipped: Array<{ slug: string; reason: string }>
    errors: Array<{ slug: string; error: string }>
    totalArticles: number
}

let lastRunLog: AgentRunLog | null = null
export function getLastRunLog(): AgentRunLog | null { return lastRunLog }

export async function runDailyAgent(maxArticles = 5): Promise<AgentRunLog> {
    const startedAt = new Date().toISOString()
    console.log(`[Agent] Daily run started — max ${maxArticles} articles`)

    const published: AgentRunLog['published'] = []
    const skipped: AgentRunLog['skipped'] = []
    const errors: AgentRunLog['errors'] = []
    let plan: ArticleBrief[] = []

    // ── Step 1: Gather context ─────────────────────────────────────────────────
    const todayIST = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
    })

    // Upcoming exams (next 14 days)
    const upcomingExams = getUpcomingExams(14).map(e => ({
        subject: e.subject,
        category: e.category,
        daysUntil: e.daysUntil,
    }))
    console.log(`[Agent] Upcoming exams: ${upcomingExams.map(e => `${e.category} ${e.subject} (${e.daysUntil}d)`).join(', ') || 'none'}`)

    // News headlines (for planner awareness)
    let newsHeadlines: Array<{ headline: string; summary: string; sourceUrl: string; sourceName: string }> = []
    try {
        const news = await fetchCBSENews()
        newsHeadlines = news.map(n => ({ headline: n.headline, summary: n.summary, sourceUrl: n.sourceUrl, sourceName: n.sourceName }))
        console.log(`[Agent] News headlines: ${news.length} found`)
    } catch (e: any) {
        console.warn('[Agent] News fetch failed (continuing without news):', e.message)
    }

    // ── Step 2: AI decides what to publish ────────────────────────────────────
    try {
        console.log('[Agent] Asking AI to plan today\'s content...')
        plan = await planTodaysContent({ todayIST, upcomingExams, newsHeadlines, maxArticles })
        console.log(`[Agent] AI plan: ${plan.map(p => p.slug).join(', ')}`)
    } catch (e: any) {
        errors.push({ slug: 'planner', error: `AI planning failed: ${e.message}` })
        console.error('[Agent] Planning failed:', e.message)
    }

    // ── Step 3: Generate + publish each planned article ───────────────────────
    for (const brief of plan) {
        if (published.length >= maxArticles) break
        try {
            console.log(`[Agent] Generating: "${brief.title.slice(0, 60)}"`)
            const article = await generateFromBrief(brief)
            const result = await publishArticle({
                ...article,
                type: brief.type,
                category: brief.category,
                subject: brief.subject,
            })
            if (result.ok) {
                published.push({ slug: article.slug, title: article.title, type: brief.type, source: 'planned' })
                console.log(`[Agent] ✅ Published: ${article.slug}`)
            } else {
                skipped.push({ slug: brief.slug, reason: result.error || 'Already exists' })
                console.log(`[Agent] ⏭ Skipped: ${brief.slug} — ${result.error}`)
            }
        } catch (e: any) {
            errors.push({ slug: brief.slug, error: e.message })
            console.error(`[Agent] ❌ Error on ${brief.slug}:`, e.message)
        }
    }

    const finishedAt = new Date().toISOString()
    const log: AgentRunLog = { startedAt, finishedAt, plan, published, skipped, errors, totalArticles: published.length }
    lastRunLog = log

    // Persist log (silent fail if table doesn't exist yet)
    try {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
        await sb.from('agent_logs').insert({
            started_at: startedAt, finished_at: finishedAt,
            published: JSON.stringify(published), skipped: JSON.stringify(skipped),
            errors: JSON.stringify(errors), total: published.length,
        })
    } catch { /* table may not exist yet */ }

    console.log(`[Agent] Done. Published: ${published.length} | Skipped: ${skipped.length} | Errors: ${errors.length}`)
    return log
}
