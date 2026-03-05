// News Fetcher — uses NewsAPI.org for live CBSE education news
// Free tier: 100 req/day — more than enough for daily cron

export interface NewsStory {
    headline: string
    summary: string
    sourceUrl: string
    sourceName: string
    publishedAt: string
    relevanceScore: number
}

export async function fetchCBSENews(): Promise<NewsStory[]> {
    const apiKey = process.env.NEWS_API_KEY
    if (!apiKey) throw new Error('NEWS_API_KEY not set')

    // Search last 2 days for CBSE / board exam news
    const from = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const q = encodeURIComponent('CBSE OR "board exam" OR "Class 10" OR "Class 12" OR NCERT')
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&from=${from}&pageSize=10&apiKey=${apiKey}`

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`NewsAPI ${res.status}: ${txt.slice(0, 200)}`)
    }

    const data = await res.json()
    const articles = (data.articles || []) as any[]

    return articles
        .filter((a: any) => a.title && a.description && a.url && !a.title.includes('[Removed]'))
        .map((a: any) => {
            const text = (a.title + ' ' + a.description).toLowerCase()
            let score = 5
            if (text.includes('cbse')) score += 2
            if (text.includes('board exam')) score += 2
            if (text.includes('class 10') || text.includes('class 12')) score += 1
            if (text.includes('result')) score += 1
            if (text.includes('ncert')) score += 1
            return {
                headline: a.title,
                summary: a.description,
                sourceUrl: a.url,
                sourceName: a.source?.name || 'News Source',
                publishedAt: a.publishedAt,
                relevanceScore: Math.min(score, 10),
            }
        })
        .sort((a: NewsStory, b: NewsStory) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3)
}
